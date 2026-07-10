const API = {
  async call(action, payload = {}, auth = true) {
    const body = {action, ...payload};
    if (auth) body.sessionToken = localStorage.getItem('requestActSession') || '';

    showLoading(true);
    try {
      const response = await fetch(REQUEST_ACT_CONFIG.API_URL, {
        method:'POST',
        body:JSON.stringify(body)
      });
      const result = await response.json();

      if (!result.ok && /Session/.test(result.message || '')) {
        clearSession();
        location.reload();
      }

      return result;
    } catch (err) {
      return {ok:false, message:'เชื่อมต่อระบบไม่สำเร็จ: ' + err.message};
    } finally {
      showLoading(false);
    }
  }
};
