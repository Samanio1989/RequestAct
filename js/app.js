let currentUser = JSON.parse(localStorage.getItem('requestActUser') || 'null');
let myRequests = [];
let adminRequests = [];

function $(id){ return document.getElementById(id); }

function escapeHtml(value){
  return String(value == null ? '' : value).replace(/[&<>"']/g, c => ({
    '&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'
  }[c]));
}

function clearSession(){
  localStorage.removeItem('requestActSession');
  localStorage.removeItem('requestActUser');
  currentUser = null;
}

function showLoading(show){
  $('loader').classList.toggle('hidden', !show);
}

function toast(message){
  $('toast').textContent = message;
  $('toast').classList.remove('hidden');
  clearTimeout(window.__toastTimer);
  window.__toastTimer = setTimeout(() => $('toast').classList.add('hidden'), 4500);
}

function link(url, label='เปิดลิงก์'){
  return url
    ? `<a href="${escapeHtml(url)}" target="_blank" rel="noopener">${escapeHtml(label)}</a>`
    : '-';
}

function showPage(id, button){
  document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
  $(id).classList.add('active');
  document.querySelectorAll('.menu button').forEach(b => b.classList.remove('active'));
  if (button) button.classList.add('active');
}

function parseTypes(value){
  return String(value || '').split(',').map(x => x.trim()).filter(Boolean);
}

function hasType(request, type){
  return parseTypes(request['ประเภทระบบ']).includes(type);
}

function consumeLineLoginCallback(){
  const params = new URLSearchParams(location.hash.replace(/^#/, ''));
  if (params.get('lineLogin') === 'success' && params.get('sessionToken')) {
    localStorage.setItem('requestActSession', params.get('sessionToken'));
    sessionStorage.setItem('requestActLineNewUser', params.get('newUser') || '0');
    history.replaceState(null, '', location.pathname + location.search);
    return true;
  }
  if (params.get('lineLogin') === 'error') {
    const message = params.get('message') || 'เข้าสู่ระบบด้วย LINE ไม่สำเร็จ';
    history.replaceState(null, '', location.pathname + location.search);
    setTimeout(() => toast(message), 100);
  }
  return false;
}

async function init(){
  consumeLineLoginCallback();
  if (localStorage.getItem('requestActSession') && !currentUser) {
    const res = await API.call('getProfile');
    if (res.ok) {
      currentUser = res.user;
      localStorage.setItem('requestActUser', JSON.stringify(currentUser));
    }
  }

  if (!currentUser || !localStorage.getItem('requestActSession')) {
    $('sidebar').classList.add('hidden');
    document.querySelector('.main').classList.add('full-width');
    showPage('loginPage');
    return;
  }

  $('sidebar').classList.remove('hidden');
  $('userBox').innerHTML = `👤 ${escapeHtml(currentUser.fullname)}<br><span class="small">${escapeHtml(currentUser.role)}</span>`;
  $('btnAdmin').classList.toggle('hidden', currentUser.role !== 'ADMIN');
  fillProfile();
  setupLevelOptions();
  const incomplete = !currentUser.orgType || !currentUser.organization || !/^0\d{9}$/.test(currentUser.phone || '');
  if (incomplete || sessionStorage.getItem('requestActLineNewUser') === '1') {
    sessionStorage.removeItem('requestActLineNewUser');
    showPage('profilePage', $('btnProfile'));
    setTimeout(() => toast('กรุณากรอกประเภทหน่วยงาน หน่วยงาน และเบอร์โทรให้ครบก่อนส่งคำขอ'), 150);
  } else {
    showPage('requestPage', $('btnRequest'));
  }
}

document.addEventListener('DOMContentLoaded', init);
