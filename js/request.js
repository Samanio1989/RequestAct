function toggleTypes(){
  $('checkInBox').classList.toggle('hidden', !$('typeCheckIn').checked);
  $('passcodeBox').classList.toggle('hidden', !$('typePasscode').checked);
}

function setupLevelOptions(){
  const values = [
    'คณะ - เข้าทั้งคณะ',
    'คณะ - เข้าเฉพาะสาขา',
    'มหาวิทยาลัย - ภายใต้งบประมาณของหน่วยงานอื่น'
  ];

  if (currentUser.orgType === 'หน่วยงานภายในมหาวิทยาลัย') {
    values.unshift('มหาวิทยาลัย');
  }

  const html = '<option value="">-- เลือกระดับกิจกรรม --</option>' +
    values.map(x => `<option>${escapeHtml(x)}</option>`).join('');

  $('checkInLevel').innerHTML = html;
  $('passcodeLevel').innerHTML = html;
}

function toggleLevelDetail(prefix){
  const select = $(prefix + 'Level');
  const box = $(prefix + 'LevelDetailBox');
  const label = $(prefix + 'LevelDetailLabel');
  const input = $(prefix + 'LevelDetail');

  if (select.value === 'คณะ - เข้าเฉพาะสาขา') {
    box.classList.remove('hidden');
    label.textContent = 'ชื่อสาขา';
    input.placeholder = 'ระบุชื่อสาขา';
  } else if (select.value === 'มหาวิทยาลัย - ภายใต้งบประมาณของหน่วยงานอื่น') {
    box.classList.remove('hidden');
    label.textContent = 'ชื่อหน่วยงานเจ้าของงบประมาณ';
    input.placeholder = 'ระบุชื่อหน่วยงาน';
  } else {
    box.classList.add('hidden');
    input.value = '';
  }
}

async function createRequest(){
  if (!currentUser || !currentUser.orgType || !currentUser.organization || !/^0\d{9}$/.test(currentUser.phone || '')) {
    showPage('profilePage', $('btnProfile'));
    return toast('กรุณากรอกข้อมูลผู้ใช้งานและเบอร์โทรให้ครบก่อนส่งคำขอ');
  }
  const types = [];
  if ($('typeCheckIn').checked) types.push('Check-In');
  if ($('typePasscode').checked) types.push('Passcode');

  const passcodeYears = [...document.querySelectorAll('.pcYear:checked')].map(x => x.value);

  const res = await API.call('createRequest', {
    activityName:$('activityName').value,
    systemTypes:types,
    activityDate:$('activityDate').value,
    participants:$('participants').value,
    startTime:$('startTime').value,
    endTime:$('endTime').value,
    place:$('place').value,

    checkInStart:types.includes('Check-In') ? $('checkInStart').value : '',
    checkInEnd:types.includes('Check-In') ? $('checkInEnd').value : '',
    checkOutStart:types.includes('Check-In') ? $('checkOutStart').value : '',
    checkOutEnd:types.includes('Check-In') ? $('checkOutEnd').value : '',
    locationCheckIn:types.includes('Check-In') ? $('locationCheckIn').value : '',
    locationCheckOut:types.includes('Check-In') ? $('locationCheckOut').value : '',
    checkInDetail:types.includes('Check-In') ? $('checkInDetail').value : '',
    checkInLevel:types.includes('Check-In') ? $('checkInLevel').value : '',
    checkInLevelDetail:types.includes('Check-In') ? $('checkInLevelDetail').value : '',

    passcodeYears:types.includes('Passcode') ? passcodeYears : [],
    passcodeLevel:types.includes('Passcode') ? $('passcodeLevel').value : '',
    passcodeLevelDetail:types.includes('Passcode') ? $('passcodeLevelDetail').value : '',

    driveFolderLink:$('driveFolderLink').value,
    hasSchedulePdf:$('hasSchedulePdf').checked,
    hasStudentListExcel:$('hasStudentListExcel').checked,
    hasBannerFile:$('hasBannerFile').checked,
    bannerLink:$('bannerLink').value
  });

  toast(res.message + (res.requestId ? ` (${res.requestId})` : ''));

  if (res.ok) {
    $('requestForm').reset();
    toggleTypes();
  }
}
