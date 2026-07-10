async function loadAdmin(){
  showPage('adminPage',$('btnAdmin'));
  const [summary,requests]=await Promise.all([
    API.call('dashboardSummary'),
    API.call('allRequests')
  ]);
  if(summary.ok) renderSummary(summary.data);
  if(!requests.ok) return toast(requests.message);
  adminRequestData=requests.data||[];
  renderAdminRequests();
}

function renderSummary(s){
  $('adminSummary').innerHTML=[
    ['ทั้งหมด',s.total],['ส่งคำขอ',s.submitted],['รับทราบ',s.acknowledged],['ออกรหัสแล้ว',s.issued],['ยกเลิก',s.cancelled]
  ].map(([name,value])=>`<div class="metric"><strong>${value}</strong>${name}</div>`).join('');
}

function renderAdminRequests(){
  const q=$('adminSearch').value.toLowerCase();
  const status=$('adminFilter').value;
  const rows=adminRequestData.filter(r=>{
    const text=(r.RequestID+' '+r['ชื่อกิจกรรม']+' '+r['ประเภทระบบ']).toLowerCase();
    return (!q||text.includes(q)) && (!status||r['สถานะ']===status);
  });

  $('adminRequests').innerHTML=rows.map(r=>adminCard(r)).join('')||'<div class="notice">ไม่พบรายการ</div>';
}

function adminCard(r){
  const id=escapeHtml(r.RequestID);
  const hasCI=String(r['ประเภทระบบ']).includes('Check-In');
  const hasPC=String(r['ประเภทระบบ']).includes('Passcode');

  return `<div class="request-card">
    <h3>${escapeHtml(r['ชื่อกิจกรรม'])}</h3>
    <p><b>${id}</b> · ${escapeHtml(r['ประเภทระบบ'])} · ${escapeHtml(r['วันที่จัดกิจกรรม'])}</p>
    <p>เอกสาร: ${link(r['ลิงก์โฟลเดอร์ Google Drive'])}</p>
    <label>สถานะ</label>
    <select id="st_${id}" onchange="toggleIssue('${id}')">
      ${['🔵 ส่งคำขอ','🟡 รับทราบ','🟢 ออกรหัสกิจกรรมแล้ว','🔴 ยกเลิก'].map(s=>`<option ${s===r['สถานะ']?'selected':''}>${s}</option>`).join('')}
    </select>
    <label style="margin-top:10px">หมายเหตุ</label>
    <textarea id="note_${id}">${escapeHtml(r['หมายเหตุแอดมิน']||'')}</textarea>
    <div id="issue_${id}" class="${r['สถานะ']==='🟢 ออกรหัสกิจกรรมแล้ว'?'':'hidden'}">
      ${hasCI?`<div class="card"><h3>✅ Check-In</h3>
        <div class="grid">
          <div><label>เริ่ม Check-In</label><input id="cis_${id}" type="time" value="${escapeHtml(r.CheckInStart||'')}"></div>
          <div><label>สิ้นสุด Check-In</label><input id="cie_${id}" type="time" value="${escapeHtml(r.CheckInEnd||'')}"></div>
          <div><label>เริ่ม Check-Out</label><input id="cos_${id}" type="time" value="${escapeHtml(r.CheckOutStart||'')}"></div>
          <div><label>สิ้นสุด Check-Out</label><input id="coe_${id}" type="time" value="${escapeHtml(r.CheckOutEnd||'')}"></div>
        </div></div>`:hiddenAdminInputs(id,'ci')}
      ${hasPC?`<div class="card"><h3>🔑 Passcode</h3>
        <label>ลิงก์รายชื่อ</label><input id="psl_${id}" value="${escapeHtml(r['ลิงก์รายชื่อ Passcode']||'')}">
        <label>ลิงก์ Passcode</label><input id="pcl_${id}" value="${escapeHtml(r['ลิงก์ Passcode']||'')}">
        <div class="grid">
          <div><label>เริ่มกรอก</label><input id="pcs_${id}" type="datetime-local"></div>
          <div><label>สิ้นสุดกรอก</label><input id="pce_${id}" type="datetime-local"></div>
        </div></div>`:hiddenAdminInputs(id,'pc')}
    </div>
    <button class="btn green" onclick="updateStatus('${id}')">บันทึกและแจ้ง LINE</button>
  </div>`;
}

function hiddenAdminInputs(id,type){
  if(type==='ci') return `<input id="cis_${id}" type="hidden"><input id="cie_${id}" type="hidden"><input id="cos_${id}" type="hidden"><input id="coe_${id}" type="hidden">`;
  return `<input id="psl_${id}" type="hidden"><input id="pcl_${id}" type="hidden"><input id="pcs_${id}" type="hidden"><input id="pce_${id}" type="hidden">`;
}

function toggleIssue(id){ $('issue_'+id).classList.toggle('hidden',$('st_'+id).value!=='🟢 ออกรหัสกิจกรรมแล้ว'); }

async function updateStatus(id){
  const res=await API.call('updateRequestStatus',{
    requestId:id,
    status:$('st_'+id).value,
    adminNote:$('note_'+id).value,
    checkInSystemLink:REQUEST_ACT_CONFIG.CHECKIN_URL,
    adminCheckInStart:$('cis_'+id).value,
    adminCheckInEnd:$('cie_'+id).value,
    adminCheckOutStart:$('cos_'+id).value,
    adminCheckOutEnd:$('coe_'+id).value,
    passcodeStudentListLink:$('psl_'+id).value,
    passcodeLink:$('pcl_'+id).value,
    passcodeStart:$('pcs_'+id).value,
    passcodeEnd:$('pce_'+id).value
  });
  toast(res.message);
  if(res.ok) loadAdmin();
}
