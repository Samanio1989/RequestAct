async function loadMyRequests(){
  showPage('statusPage', $('btnStatus'));
  const res = await API.call('myRequests');

  if (!res.ok) return toast(res.message);

  myRequests = res.data || [];

  if (!myRequests.length) {
    $('requestSelector').innerHTML = '<option>ยังไม่มีคำขอ</option>';
    $('selectedRequest').innerHTML = '<div class="notice">ยังไม่มีรายการคำขอ</div>';
    return;
  }

  $('requestSelector').innerHTML = myRequests.map((r, i) =>
    `<option value="${i}">${escapeHtml(r['ชื่อกิจกรรม'])} | ${escapeHtml(r['วันที่จัดกิจกรรม'])} | ${escapeHtml(r['สถานะ'])}</option>`
  ).join('');

  showSelectedRequest();
}

function showSelectedRequest(){
  const request = myRequests[Number($('requestSelector').value || 0)];
  if (!request) return;

  let issued = '';

  if (request['สถานะ'] === '🟢 ออกรหัสกิจกรรมแล้ว') {
    if (hasType(request, 'Check-In')) {
      issued += `
        <hr><h3>✅ ระบบ Check-In</h3>
        <p><b>Check-In:</b> ${escapeHtml(request.CheckInStart)} - ${escapeHtml(request.CheckInEnd)}</p>
        <p><b>Check-Out:</b> ${escapeHtml(request.CheckOutStart)} - ${escapeHtml(request.CheckOutEnd)}</p>
        <p>${link(REQUEST_ACT_CONFIG.CHECKIN_URL, 'เข้าใช้งานระบบ Check-In')}</p>`;
    }

    if (hasType(request, 'Passcode')) {
      issued += `
        <hr><h3>🔑 ระบบ Passcode</h3>
        <p><b>รายชื่อ:</b> ${link(request['ลิงก์รายชื่อ Passcode'])}</p>
        <p><b>Passcode:</b> ${link(request['ลิงก์ Passcode'])}</p>
        <p><b>ช่วงเวลา:</b> ${escapeHtml(request['Passcode เริ่ม'])} ถึง ${escapeHtml(request['Passcode สิ้นสุด'])}</p>
        <p>${link(REQUEST_ACT_CONFIG.PASSCODE_URL, 'เข้าใช้งานระบบ Passcode')}</p>`;
    }
  }

  $('selectedRequest').innerHTML = `
    <div class="request-card">
      <h3>${escapeHtml(request['ชื่อกิจกรรม'])}</h3>
      <p><b>เลขที่คำขอ:</b> ${escapeHtml(request.RequestID)}</p>
      <p><b>สถานะ:</b> <span class="status-pill">${escapeHtml(request['สถานะ'])}</span></p>
      <p><b>ประเภทระบบ:</b> ${escapeHtml(request['ประเภทระบบ'])}</p>
      <p><b>หมายเหตุ:</b> ${escapeHtml(request['หมายเหตุแอดมิน'] || '-')}</p>
      <p><b>เอกสาร:</b> ${link(request['ลิงก์โฟลเดอร์ Google Drive'])}</p>
      ${issued}
    </div>`;
}
