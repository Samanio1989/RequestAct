let calendarDate = new Date();
let calendarEvents = [];

async function loadCalendar(){
  showPage('calendarPage', $('btnCalendar'));
  const first = new Date(calendarDate.getFullYear(), calendarDate.getMonth(), 1);
  const last = new Date(calendarDate.getFullYear(), calendarDate.getMonth() + 1, 0);
  const res = await API.call('calendarRequests', {
    start:localDateKey(first), end:localDateKey(last), includeCancelled:true
  });
  if (!res.ok) return toast(res.message);
  calendarEvents = res.data || [];
  renderCalendar();
}

function changeCalendarMonth(amount){
  calendarDate = new Date(calendarDate.getFullYear(), calendarDate.getMonth() + amount, 1);
  loadCalendar();
}

function goCalendarToday(){
  calendarDate = new Date();
  loadCalendar();
}

function localDateKey(date){
  const y = date.getFullYear();
  const m = String(date.getMonth()+1).padStart(2,'0');
  const d = String(date.getDate()).padStart(2,'0');
  return `${y}-${m}-${d}`;
}

function renderCalendar(){
  const year = calendarDate.getFullYear();
  const month = calendarDate.getMonth();
  const type = $('calendarType').value;
  const status = $('calendarStatus').value;
  const months = ['มกราคม','กุมภาพันธ์','มีนาคม','เมษายน','พฤษภาคม','มิถุนายน','กรกฎาคม','สิงหาคม','กันยายน','ตุลาคม','พฤศจิกายน','ธันวาคม'];
  $('calendarTitle').textContent = `${months[month]} ${year + 543}`;

  const filtered = calendarEvents.filter(e => (!type || String(e.systemTypes).includes(type)) && (!status || e.status === status));
  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const today = localDateKey(new Date());
  const weekday = ['อา','จ','อ','พ','พฤ','ศ','ส'];
  let html = weekday.map(x => `<div class="calendar-weekday">${x}</div>`).join('');

  for(let i=0;i<firstDay;i++) html += '<div class="calendar-cell muted-cell"></div>';
  for(let day=1; day<=daysInMonth; day++){
    const key = `${year}-${String(month+1).padStart(2,'0')}-${String(day).padStart(2,'0')}`;
    const events = filtered.filter(e => e.date === key);
    html += `<div class="calendar-cell ${key===today?'today':''}"><div class="calendar-day">${day}</div>` +
      events.map((e,i) => `<button class="calendar-event ${calendarStatusClass(e.status)}" onclick="showCalendarEvent('${escapeHtml(e.requestUid)}')" title="${escapeHtml(e.title)}">${escapeHtml(e.startTime || '')} ${escapeHtml(e.title)}</button>`).join('') +
      '</div>';
  }
  const used = firstDay + daysInMonth;
  for(let i=used;i<42;i++) html += '<div class="calendar-cell muted-cell"></div>';
  $('calendarGrid').innerHTML = html;
  $('calendarDetail').classList.add('hidden');
}

function calendarStatusClass(status){
  if (String(status).includes('ออกรหัส')) return 'event-issued';
  if (String(status).includes('รับทราบ')) return 'event-ack';
  if (String(status).includes('ยกเลิก')) return 'event-cancel';
  return 'event-submit';
}

function showCalendarEvent(uid){
  const e = calendarEvents.find(x => x.requestUid === uid);
  if (!e) return;
  const box = $('calendarDetail');
  box.innerHTML = `<button class="calendar-close" onclick="$('calendarDetail').classList.add('hidden')">×</button>
    <h3>${escapeHtml(e.title)}</h3>
    <p><b>เลขที่คำขอ:</b> ${escapeHtml(e.requestId)}</p>
    <p><b>วันที่–เวลา:</b> ${escapeHtml(e.date)} ${escapeHtml(e.startTime)}–${escapeHtml(e.endTime)}</p>
    <p><b>สถานที่:</b> ${escapeHtml(e.place || '-')}</p>
    <p><b>ประเภท:</b> ${escapeHtml(e.systemTypes)}</p>
    <p><b>จำนวนผู้เข้าร่วม:</b> ${escapeHtml(e.participants)}</p>
    <p><b>สถานะ:</b> <span class="status-pill">${escapeHtml(e.status)}</span></p>`;
  box.classList.remove('hidden');
  box.scrollIntoView({behavior:'smooth', block:'nearest'});
}
