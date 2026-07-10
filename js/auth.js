async function login(){
  const res=await API.call('login',{username:$('loginUser').value,password:$('loginPass').value},false);
  if(!res.ok) return toast(res.message);
  localStorage.setItem('requestActSession',res.sessionToken);
  localStorage.setItem('requestActUser',JSON.stringify(res.user));
  location.reload();
}

async function register(){
  const res=await API.call('register',{
    fullname:$('regFullname').value,
    orgType:$('regOrgType').value,
    organization:$('regOrganization').value,
    phone:$('regPhone').value,
    username:$('regUser').value,
    password:$('regPass').value
  },false);
  toast(res.message);
  if(res.ok) showPage('loginPage');
}

async function logout(){
  await API.call('logout');
  clearSession();
  location.reload();
}

function fillProfile(){
  $('pfFullname').value=currentUser.fullname||'';
  $('pfOrgType').value=currentUser.orgType||'คณะ';
  $('pfOrganization').value=currentUser.organization||'';
  $('pfPhone').value=currentUser.phone||'';
  $('lineStatus').textContent=currentUser.lineUserId ? `เชื่อมแล้ว: ${currentUser.lineDisplayName || currentUser.lineUserId}` : 'ยังไม่ได้เชื่อม LINE';
}

async function updateProfile(){
  const res=await API.call('updateProfile',{
    fullname:$('pfFullname').value,
    orgType:$('pfOrgType').value,
    organization:$('pfOrganization').value,
    phone:$('pfPhone').value
  });
  toast(res.message);
  if(res.ok){
    currentUser=res.user;
    localStorage.setItem('requestActUser',JSON.stringify(currentUser));
    fillProfile();
  }
}
