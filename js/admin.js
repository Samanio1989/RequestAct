async function loadAdmin(){
  showPage('adminPage', $('btnAdmin'));

  const [summaryRes, requestsRes] = await Promise.all([
    API.call('dashboardSummary'),
    API.call('allRequests')
  ]);

  if (summaryRes.ok) renderSummary(summaryRes.data);
  if (!requestsRes.ok) return toast(requestsRes.message);

  adminRequests = requestsRes.data || [];
  renderAdminRequests();
}

function renderSummary(data){
  const items = [
    ['ทั้งหมด', data.total],
    ['ส่งคำขอ', data.submitted],
    ['รับทราบ', data.acknowledged],
    ['ออกรหัสแล้ว', data.issued],
    ['ยกเลิก', data.cancelled]
  ];

  $('adminSummary').innerHTML = items.map(([name, value]) =>
    `<div class="metric"><strong>${value}</strong><span>${escapeHtml(name)}</span></div>`
  ).join('');
}

function renderAdminRequests(){
  const search = $('adminSearch').value.toLowerCase();
  const status = $('adminFilter').value;

  const filtered = adminRequests.filter(request => {
    const text = `${request.RequestID} ${request['ชื่อกิจกรรม']} ${request['ประเภทระบบ']}`.toLowerCase();
    return (!search || text.includes(search)) && (!status || request['สถานะ'] === status);
  });

  $('adminRequests').innerHTML = filtered.length
    ? filtered.map((request, index) => adminRequestCard(request, index)).join('')
    : '<div class="notice">ไม่พบรายการ</div>';
}

function adminRequestCard(request, index){
  const key = 'req_' + index;
  const showCheckIn = hasType(request, 'Check-In');
  const showPasscode = hasType(request, 'Passcode');

  return `
    <div class="request-card" data-request-uid="${escapeHtml(request.RequestUID)}">
      <h3>${escapeHtml(request['ชื่อกิจกรรม'])}</h3>
      <p><b>${escapeHtml(request.RequestID)}</b> · ${escapeHtml(request['ประเภทระบบ'])} · ${escapeHtml(request['วันที่จัดกิจกรรม'])}</p>
      <p><b>เอกสาร:</b> ${link(request['ลิงก์โฟลเดอร์ Google Drive'])}</p>

      <label for="status_${key}">สถานะ</label>
      <select id="status_${key}" onchange="toggleIssuedFields('${key}')">
        ${['🔵 ส่งคำขอ','🟡 รับทราบ','🟢 ออกรหัสกิจกรรมแล้ว','🔴 ยกเลิก']
          .map(s => `<option value="${escapeHtml(s)}" ${s === request['สถานะ'] ? 'selected' : ''}>${escapeHtml(s)}</option>`)
          .join('')}
      </select>

      <label for="note_${key}" style="margin-top:10px">หมายเหตุ</label>
      <textarea id="note_${key}">${escapeHtml(request['หมายเหตุแอดมิน'] || '')}</textarea>

      <div id="issued_${key}" class="${request['สถานะ'] === '🟢 ออกรหัสกิจกรรมแล้ว' ? '' : 'hidden'}">
        ${showCheckIn ? `
          <div class="sub-card">
            <h4>✅ ระบบ Check-In</h4>
            <div class="grid">
              <div><label>Check-In เริ่ม</label><input id="ciStart_${key}" type="time" value="${escapeHtml(request.CheckInStart || '')}"></div>
              <div><label>Check-In สิ้นสุด</label><input id="ciEnd_${key}" type="time" value="${escapeHtml(request.CheckInEnd || '')}"></div>
              <div><label>Check-Out เริ่ม</label><input id="coStart_${key}" type="time" value="${escapeHtml(request.CheckOutStart || '')}"></div>
              <div><label>Check-Out สิ้นสุด</label><input id="coEnd_${key}" type="time" value="${escapeHtml(request.CheckOutEnd || '')}"></div>
            </div>
          </div>` : hiddenCheckInInputs(key)}

        ${showPasscode ? `
          <div class="sub-card">
            <h4>🔑 ระบบ Passcode</h4>
            <label>ลิงก์รายชื่อผู้เข้าร่วม</label>
            <input id="studentLink_${key}" value="${escapeHtml(request['ลิงก์รายชื่อ Passcode'] || '')}">
            <label>ลิงก์ Passcode</label>
            <input id="passcodeLink_${key}" value="${escapeHtml(request['ลิงก์ Passcode'] || '')}">
            <div class="grid">
              <div><label>เริ่มกรอก Passcode</label><input id="passStart_${key}" type="datetime-local" value="${escapeHtml(toDateTimeLocal(request['Passcode เริ่ม']))}"></div>
              <div><label>สิ้นสุดกรอก Passcode</label><input id="passEnd_${key}" type="datetime-local" value="${escapeHtml(toDateTimeLocal(request['Passcode สิ้นสุด']))}"></div>
            </div>
          </div>` : hiddenPasscodeInputs(key)}
      </div>

      <button class="btn green" onclick="saveRequestStatus('${key}','${escapeHtml(request.RequestUID)}')">
        บันทึกสถานะและแจ้ง LINE
      </button>
    </div>`;
}

function hiddenCheckInInputs(key){
  return `
    <input id="ciStart_${key}" type="hidden">
    <input id="ciEnd_${key}" type="hidden">
    <input id="coStart_${key}" type="hidden">
    <input id="coEnd_${key}" type="hidden">`;
}

function hiddenPasscodeInputs(key){
  return `
    <input id="studentLink_${key}" type="hidden">
    <input id="passcodeLink_${key}" type="hidden">
    <input id="passStart_${key}" type="hidden">
    <input id="passEnd_${key}" type="hidden">`;
}

function toggleIssuedFields(key){
  $('issued_' + key).classList.toggle(
    'hidden',
    $('status_' + key).value !== '🟢 ออกรหัสกิจกรรมแล้ว'
  );
}

async function saveRequestStatus(key, requestUid){
  const selectedStatus = $('status_' + key).value;

  const res = await API.call('updateRequestStatus', {
    requestUid:requestUid,
    status:selectedStatus,
    adminNote:$('note_' + key).value,

    checkInSystemLink:REQUEST_ACT_CONFIG.CHECKIN_URL,
    adminCheckInStart:$('ciStart_' + key).value,
    adminCheckInEnd:$('ciEnd_' + key).value,
    adminCheckOutStart:$('coStart_' + key).value,
    adminCheckOutEnd:$('coEnd_' + key).value,

    passcodeStudentListLink:$('studentLink_' + key).value,
    passcodeLink:$('passcodeLink_' + key).value,
    passcodeStart:$('passStart_' + key).value,
    passcodeEnd:$('passEnd_' + key).value
  });

  toast(res.message);

  if (res.ok) {
    await loadAdmin();
  }
}


function toDateTimeLocal(value){
  const text = String(value || '').trim();
  if (!text) return '';
  const normalized = text.replace(' ', 'T');
  return normalized.length >= 16 ? normalized.slice(0,16) : normalized;
}
