function toggleTypes(){
  $('checkInBox').classList.toggle('hidden',!$('typeCheckIn').checked);
  $('passcodeBox').classList.toggle('hidden',!$('typePasscode').checked);
}

function setupLevelOptions(){
  const list=['คณะ - เข้าทั้งคณะ','คณะ - เข้าเฉพาะสาขา','มหาวิทยาลัย - ภายใต้งบประมาณของหน่วยงานอื่น'];
  if(currentUser.orgType==='หน่วยงานภายในมหาวิทยาลัย') list.unshift('มหาวิทยาลัย');
  const html='<option value="">-- เลือกระดับกิจกรรม --</option>'+list.map(x=>`<option>${x}</option>`).join('');
  $('checkInLevel').innerHTML=html;
  $('passcodeLevel').innerHTML=html;
}

function toggleLevelDetail(type){
  const select=$(type+'Level');
  const box=$(type+'LevelDetailBox');
  const label=$(type+'LevelDetailLabel');
  const input=$(type+'LevelDetail');
  if(select.value==='คณะ - เข้าเฉพาะสาขา'){
    box.classList.remove('hidden'); label.textContent='ชื่อสาขา'; input.placeholder='ระบุชื่อสาขา';
  }else if(select.value==='มหาวิทยาลัย - ภายใต้งบประมาณของหน่วยงานอื่น'){
    box.classList.remove('hidden'); label.textContent='ชื่อหน่วยงานเจ้าของงบประมาณ'; input.placeholder='ระบุชื่อหน่วยงาน';
  }else{
    box.classList.add('hidden'); input.value='';
  }
}

async function createRequest(){
  const systemTypes=[];
  if($('typeCheckIn').checked) systemTypes.push('Check-In');
  if($('typePasscode').checked) systemTypes.push('Passcode');

  const passcodeYears=[...document.querySelectorAll('.pcYear:checked')].map(x=>x.value);

  const res=await API.call('createRequest',{
    activityName:$('activityName').value,
    systemTypes,
    activityDate:$('activityDate').value,
    participants:$('participants').value,
    startTime:$('startTime').value,
    endTime:$('endTime').value,
    place:$('place').value,
    checkInStart:$('checkInStart').value,
    checkInEnd:$('checkInEnd').value,
    checkOutStart:$('checkOutStart').value,
    checkOutEnd:$('checkOutEnd').value,
    locationCheckIn:$('locationCheckIn').value,
    locationCheckOut:$('locationCheckOut').value,
    checkInDetail:$('checkInDetail').value,
    checkInLevel:$('checkInLevel').value,
    checkInLevelDetail:$('checkInLevelDetail').value,
    passcodeYears,
    passcodeLevel:$('passcodeLevel').value,
    passcodeLevelDetail:$('passcodeLevelDetail').value,
    driveFolderLink:$('driveFolderLink').value,
    hasSchedulePdf:$('hasSchedulePdf').checked,
    hasStudentListExcel:$('hasStudentListExcel').checked,
    hasBannerFile:$('hasBannerFile').checked,
    bannerLink:$('bannerLink').value
  });

  toast(res.message + (res.requestId ? ` (${res.requestId})` : ''));
  if(res.ok){ document.querySelector('#requestPage form').reset(); toggleTypes(); }
}
