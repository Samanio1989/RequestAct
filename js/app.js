let currentUser = JSON.parse(localStorage.getItem('requestActUser') || 'null');
let myRequestData = [];
let adminRequestData = [];

function $(id){ return document.getElementById(id); }
function escapeHtml(v){ return String(v ?? '').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'}[c])); }
function showLoading(show){ $('loader').classList.toggle('hidden', !show); }
function toast(message){ $('toast').textContent=message; $('toast').classList.remove('hidden'); setTimeout(()=>$('toast').classList.add('hidden'),3000); }
function clearSession(){ localStorage.removeItem('requestActSession'); localStorage.removeItem('requestActUser'); currentUser=null; }
function link(url,label='เปิดลิงก์'){ return url ? `<a href="${escapeHtml(url)}" target="_blank" rel="noopener">${label}</a>` : '-'; }

function showPage(id, button){
  document.querySelectorAll('.page').forEach(p=>p.classList.remove('active'));
  $(id).classList.add('active');
  document.querySelectorAll('.menu button').forEach(b=>b.classList.remove('active'));
  if(button) button.classList.add('active');
}

function init(){
  if(currentUser && localStorage.getItem('requestActSession')){
    $('sidebar').classList.remove('hidden');
    $('userBox').innerHTML=`👤 ${escapeHtml(currentUser.fullname)}<br><span class="small">${escapeHtml(currentUser.role)}</span>`;
    $('btnAdmin').classList.toggle('hidden', currentUser.role !== 'ADMIN');
    fillProfile();
    setupLevelOptions();
    showPage('requestPage',$('btnRequest'));
  }else{
    $('sidebar').classList.add('hidden');
    document.querySelector('.main').style.marginLeft='0';
    document.querySelector('.main').style.width='100%';
    showPage('loginPage');
  }
}
document.addEventListener('DOMContentLoaded',init);
