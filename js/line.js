async function createLineLinkCode(){
  const res=await API.call('createLineLinkCode');
  if(!res.ok) return toast(res.message);
  $('lineLinkResult').innerHTML=`
    <div class="notice">
      <h3 style="margin-top:0">รหัสเชื่อม LINE: <strong>${escapeHtml(res.code)}</strong></h3>
      <p>หมดอายุ: ${escapeHtml(res.expiresAt)}</p>
      <p>1. เพิ่มเพื่อน LINE OA</p>
      <p>2. ส่งข้อความ <b>เชื่อม ${escapeHtml(res.code)}</b> ในห้องแชท</p>
      <p>${link(REQUEST_ACT_CONFIG.LINE_OA_URL,'เพิ่มเพื่อน DSD RequestAct')}</p>
    </div>`;
}

async function testLine(){
  const res=await API.call('testLine');
  toast(res.message);
}

function startLineLogin(){
  const token=localStorage.getItem('requestActSession');
  location.href=REQUEST_ACT_CONFIG.API_URL+'?action=lineLogin&sessionToken='+encodeURIComponent(token);
}
