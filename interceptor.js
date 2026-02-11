(function() {
  const _origFetch = window.fetch;
  window.fetch = async function(...args) {
    const response = await _origFetch.apply(this, args);

    const url = typeof args[0] === 'string' ? args[0] : args[0]?.url || '';

    if (url.includes('/yard/api') && url.includes('type=agent') && url.includes('oid=oids')) {
      try {
        const clone = response.clone();
        const data = await clone.json();
        if (Array.isArray(data)) {
          const params = new URLSearchParams(url.split('?')[1]);
          const pcode = params.get('pcode');
          if (pcode) {
            window.postMessage({
              type: 'WHATAP_QN_AGENT_DATA',
              pcode: pcode,
              agents: data.map(a => ({
                oid: a.oid, oname: a.oname, ip: a.ip,
                isActive: a.isActive, alias: a.alias, initial: a.initial
              }))
            }, window.location.origin);
          }
        }
      } catch (e) { /* ignore */ }
    }

    return response;
  };
})();
