async function loadMyRequests(){
  showPage('statusPage',$('btnStatus'));
  const res=await API.call('myRequests');
  if(!res.ok) return toast(res.message);
  myRequestData=res.data||[];

  if(!myRequestData.length){
    $('requestSelector').innerHTML='<option>ยังไม่มีคำขอ</option>';
    $('selectedRequest').innerHTML='<div class="notice">ยังไม่มีรายการคำขอ</div>';
    return;
  }

  $('requestSelector').innerHTML=myRequestData.map((r,i)=>
    `<option value="${i}">${escapeHtml(r['ชื่อกิจกรรม'])} | ${escapeHtml(r['วันที่จัดกิจกรรม'])} | ${escapeHtml(r['สถานะ'])}</option>`
  ).join('');
  showSelectedRequest();
}

function showSelectedRequest(){
  const r=myRequestData[Number($('requestSelector').value||0)];
  if(!r) return;

  let issued='';
  if(r['สถานะ']==='🟢 ออกรหัสกิจกรรมแล้ว'){
    if(String(r['ประเภทระบบ']).includes('Check-In')){
      issued+=`<hr><h3>✅ Check-In</h3>
      <p>เวลา Check-In: ${escapeHtml(r.CheckInStart)} - ${escapeHtml(r.CheckInEnd)}</p>
      <p>เวลา Check-Out: ${escapeHtml(r.CheckOutStart)} - ${escapeHtml(r.CheckOutEnd)}</p>
      <p>${link(REQUEST_ACT_CONFIG.CHECKIN_URL,'เข้าใช้งานระบบ Check-In')}</p>`;
    }
    if(String(r['ประเภทระบบ']).includes('Passcode')){
      issued+=`<hr><h3>🔑 Passcode</h3>
      <p>รายชื่อ: ${link(r['ลิงก์รายชื่อ Passcode'])}</p>
      <p>Passcode: ${link(r['ลิงก์ Passcode'])}</p>
      <p>ช่วงเวลา: ${escapeHtml(r['Passcode เริ่ม'])} ถึง ${escapeHtml(r['Passcode สิ้นสุด'])}</p>
      <p>${link(REQUEST_ACT_CONFIG.PASSCODE_URL,'เข้าใช้งานระบบ Passcode')}</p>`;
    }
  }

  $('selectedRequest').innerHTML=`<div class="request-card">
    <h3>📌 ${escapeHtml(r['ชื่อกิจกรรม'])}</h3>
    <p><b>เลขที่คำขอ:</b> ${escapeHtml(r.RequestID)}</p>
    <p><b>สถานะ:</b> <span class="status-pill">${escapeHtml(r['สถานะ'])}</span></p>
    <p><b>วันที่:</b> ${escapeHtml(r['วันที่จัดกิจกรรม'])}</p>
    <p><b>ประเภท:</b> ${escapeHtml(r['ประเภทระบบ'])}</p>
    <p><b>หมายเหตุ:</b> ${escapeHtml(r['หมายเหตุแอดมิน']||'-')}</p>
    <p><b>เอกสาร:</b> ${link(r['ลิงก์โฟลเดอร์ Google Drive'])}</p>
    ${issued}
  </div>`;
}
