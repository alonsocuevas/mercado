var footprints = {};

(function () {
    const NEED_PUSH_TAGS = ['CART SUMMARY', 'CART_ADD', 'APPLY_COUPON', 'CHECKOUT', 'CHECKOUT_REJECT'];

    // 优先匹配，匹配到一个即停止
    const PATH_MAPPING = [
        { path: '/products/.*/warranty/upgrade/?$', tags: ['UPGRADE'] },
        { path: '/products/.*/warranty', tags: ['WARRANTY'] },
        { path: '/products/.*/parts/display/buy-now/?$', tags: ['BUYNOW'] },
        { path: '/products/.*/parts', tags: ['PARTS'] },
        { path: '/products/.*/accessory', tags: ['ACCESSORY'] },
        { path: '/products/.*/downloads', tags: ['DRIVERS & SOFTWARE'] },
        { path: '/products/.*/diagnostics-troubleshooting', tags: ['TROUBLESHOOT & DIAGNOSE'] },
        { path: '/products/.*/documentation', tags: ['HOW TO'] },
        { path: '/products/.*/document-userguide', tags: ['GUIDES & MANUALS'] },
        { path: '/products/.*/repair', tags: ['REPAIR STATUS'] },
        { path: '/products/.*/contactus', tags: ['CONTACT US'] },

        { path: '/warranty-upgrade-and-services', tags: ['WARRANTY UPGRADE SERVICES'] },
        { path: '/warrantylookup', tags: ['WARRANTY LOOKUP'] },
        { path: '/(?:parts-lookup|partslookup)', tags: ['PARTS LOOKUP'] },
        { path: '/accessorieslookup', tags: ['ACCESSORIES LOOKUP'] },

        { path: '/redport/msdcec', tags: ['MSD CEC'] },
        { path: '/redport/cec', tags: ['CEC'] },
        { path: '/redport/posa', tags: ['POSA'] },
        { path: '/redport/ordersummary', tags: ['ORDER SUMMARY'] },
        { path: '/serviceoffering', tags: ['SERVICE OFFERING'] },
        { path: '/shoplogin', tags: ['SHOP LOGIN'] },
        { path: '/cartsummary', tags: ['CART SUMMARY'] },

        { path: '/redport/parts/buynow', tags: ['VANTAGE BUYNOW'] },
        { path: '/smartperformance', tags: ['VANTAGE SMARTPERFORMANCE'] },
        { path: '/smartlock', tags: ['VANTAGE SMARTLOCK'] },
        { path: '/smartprivacy', tags: ['VANTAGE SMARTPRIVACY'] },
        { path: '/upgradesbalone', tags: ['VANTAGE SB'] },
        { path: '/upgradesbwarranty', tags: ['VANTAGE SB WARRANTY'] },
        { path: '/upgradewarranty', tags: ['VANTAGE UPGRADE'] },
    ]

    // 全匹配，即使匹配到也会继续
    const SEARCH_MAPPING = [
        // { name: 'source', value: '(?:companion|vantage)', tags: ['VANTAGE'] },
        // { name: 'source', value: 'avatar', tags: ['AVATAR'] },
        // { name: 'source', value: 'lena', tags: ['LENA'] },
        // { name: 'source', value: 'community', tags: ['COMMUNITY'] },
    ]

    // 优先匹配，匹配到一个即停止
    const REFERRER_MAPPING = [
        { url: '^https?[:]//[^/]*account[.]lenovo[.]com/?', tags: ['ACCOUNT'] },
        { url: '^https?[:]//[^/]*passport[.]lenovo[.]com/?', tags: ['PASSPORT'] },
        { url: '^https?[:]//[^/]*[.](?:lenovo|lenovouat)[.]com/[a-zA-Z]{2}/partssale/?', tags: ['FLASH'] },
        { url: '^https?[:]//canada[.]lenovo[.]com/fr/ca/partssale/?', tags: ['FLASH'] },
        { url: '^https?[:]//[^/]*[.]lenovo[.]com/([a-zA-Z]{2})/[a-zA-Z]{2}/\\1partsales/?', tags: ['HYBRIS'] },
        { url: '^https?[:]//[^/]*[.]google[.]com/?', tags: ['GOOGLE'] },
        { url: '^https?[:]//[^/]*[.]facebook[.]com/?', tags: ['FACEBOOK'] },
        { url: '^https?[:]//[^/]*[.]youtube[.]com/?', tags: ['YOUTUBE'] },
        { url: '^https?[:]//[^/]*[.]instagram[.]com/?', tags: ['INSTAGRAM'] },
        { url: '^https?[:]//[^/]*support[.]lenovo[.]com/?', tags: ['SUPPORT'] },
        { url: '^https?[:]//[^/]*[.]lenovo[.]com/?', tags: ['LENOVO.COM'] },
    ]

    function judgeNowInScSite() {
        return typeof lmd_c !== "undefined" && typeof lmd !== "undefined" && lmd.bu === "Service Connect"
    }

    function calcHttpRequestUrlPrefix() {
        return judgeNowInScSite() ? lmd_c.pcSupportOrigin.replace(/\/[a-zA-Z]{2}\/[a-zA-Z]{2}$/, "") : ""
    }

    footprints.getPathTags = function() {
        for (let i in PATH_MAPPING) {
            const mapping = PATH_MAPPING[i];
            if (new RegExp(mapping.path, 'i').test(location.pathname)) {
                return mapping.tags;
            }
        }
        return [];
    }

    footprints.getSearchTags = function() {
        const tags = [];
        for (let i in SEARCH_MAPPING) {
            const mapping = SEARCH_MAPPING[i];
            const value = footprints.getParamValue(mapping.name);
            if (value && new RegExp(mapping.value, 'i').test(value)) {
                tags.push(...mapping.tags);
                break;
            }
        }
        return footprints.distinctArray(tags);
    }

    footprints.getReferrerTags = function() {
        const referrer = document.referrer;
        if (!referrer) { // 浏览器输入或者收藏栏打开等等
            return [];
        }
        for (let i in REFERRER_MAPPING) {
            const mapping = REFERRER_MAPPING[i];
            if (new RegExp(mapping.url, 'i').test(referrer)) {
                return mapping.tags;
            }
        }
        return [new URL(referrer).host.toUpperCase()];
    }

    footprints.distinctArray = function(arr) {
        let result = [];
        let obj = {};
        for (let i of arr) {
            if (!obj[i]) {
                result.push(i);
                obj[i] = 1;
            }
        }
        return result;
    }

    footprints.getSessionID = function() {
        return footprints.getCookie('eservice_footprints_sessionID');
    }

    footprints.newSession = function() {
        const uuid = crypto.randomUUID().toUpperCase();
        footprints.setCookie('eservice_footprints_sessionID', uuid);
        footprints.setCookie('eservice_footprints_session_index', 0);
        return uuid;
    }

    footprints.nextIndex = function() {
        const next = parseInt(footprints.getCookie('eservice_footprints_session_index') || '0') + 1;
        footprints.setCookie('eservice_footprints_session_index', next);
        return next;
    }

    footprints.getCookie = function(key) {
        if (Cookies && typeof Cookies.get === 'function') {
            return Cookies.get(key);
        }
        return null;
    }

    /**
     * Expires define when the cookie will be removed. Value can be a Number
     * which will be interpreted as days from time of creation or a
     * Date instance. If omitted, the cookie becomes a session cookie.
     */
    footprints.setCookie = function(key, value, expires) {
        if (Cookies && typeof Cookies.set === 'function') {
            Cookies.set(key, value, { domain: '.lenovo.com', expires: expires || null });
        }
    }

    footprints.removeCookie = function(key) {
        if (Cookies && typeof Cookies.remove === 'function') {
            Cookies.remove(key,  { domain: '.lenovo.com' });
        }
    }

    footprints.isLandingPage = function() {
        const referrer = document.referrer;
        if (!referrer) { // 浏览器输入或者收藏栏打开等等
            const ladingPageTages = ['REMEMAILW', 'REMEMAILP', 'PROMOTIONEMAIL', 'AIMAIL', 'APOSMAIL'];
            const source = footprints.getParamValue('source').toUpperCase();
            const subsource = footprints.getParamValue('subsource').toUpperCase();
            // 特定的source或者subsource认为是landing page
            if (ladingPageTages.includes(source) || ladingPageTages.includes(subsource)) {
                return true;
            }

            return !footprints.getSessionID(); // 如果sessionID不存在，则认为是landing page
        }
        const tags = footprints.getReferrerTags();
        // 排除account站点、passport站点、flash的partssale站点、hybris的partsales站点
        if (tags.includes('ACCOUNT') || tags.includes('PASSPORT') || tags.includes('FLASH') || tags.includes('HYBRIS')) {
            return !footprints.getSessionID(); // 如果sessionID不存在，则认为是landing page
        }
        if (tags.includes('SUPPORT')) { // 排除support站点
            return !footprints.getSessionID(); // 如果sessionID不存在，则认为是landing page
        }
        return true; 
    }

    footprints.getParamValue = function(name) {
        const exp = new RegExp('[?&]' + name + '[=]([^?&#]*)', 'i').exec(location.search);
        if (!exp || exp.length < 2) {
            return '';
        }
        try {
            return decodeURIComponent(exp[1]).trim();
        } catch(e) {
            return exp[1].trim();
        }
    }

    footprints.getLocalData = function() {
        let value = localStorage.getItem('eservice_footprints_data');
        let list = [];
        try {
            list = value ? JSON.parse(value) : [];
        } catch(e) {};
        return list;
    }

    footprints.addLocalData = function(data, merge) {
        const list = footprints.getLocalData();
        if (merge) {
            data = data.filter(d => !list.some(l => l.sessionID == d.sessionID && l.index == d.index));
        }
        if (data.some(d => d.tags.some(t => NEED_PUSH_TAGS.includes(t)))) {
            footprints.addPushSession(footprints.getSessionID());
        }
        list.push(...data);
        const value = JSON.stringify(list);
        localStorage.setItem('eservice_footprints_data', value);
    }

    footprints.removeLocalData = function(data) {
        if (data) {
            let list = footprints.getLocalData();
            list = list.filter(l => !data.some(d => l.sessionID == d.sessionID && l.index == d.index));
            const value = JSON.stringify(list);
            localStorage.setItem('eservice_footprints_data', value);
        } else {
            localStorage.removeItem('eservice_footprints_data');
        }
    }

    footprints.getPushSessions = function() {
        return (footprints.getCookie('eservice_footprints_push_sessions') || '').split(',').filter(v => !!v);
    }

    footprints.setPushSessions = function(sessions) {
        if (sessions && sessions.length > 0) {
            footprints.setCookie('eservice_footprints_push_sessions', sessions.join(','), 30);
        } else {
            footprints.removeCookie('eservice_footprints_push_sessions');
        }
        return sessions;
    }

    footprints.addPushSession = function(sessionID) {
        const sessions = footprints.getPushSessions();
        if (!sessions.includes(sessionID)) {
            sessions.push(sessionID);
        }
        return footprints.setPushSessions(sessions);
    }

    footprints.removePushSession = function(sessionID) {
        const sessions = footprints.getPushSessions().filter(v => v !== sessionID);
        return footprints.setPushSessions(sessions);
    }

    footprints.resetPushSession = function() { // 如果当前session需要push，则留下当前session，否则全删除
        const sessionID = footprints.getSessionID();
        if (sessionID && footprints.getPushSessions().includes(sessionID)){
            footprints.setPushSessions([sessionID]);
        } else {
            footprints.setPushSessions(null);
        }
    }

    footprints.pushToOrigin = function(data, callback) {
        try {
            if (!data || data.length === 0) {
                callback({ code: 0, msg: { desc: "Succeed", value: null }, data: null });
                return;
            }
            const param = { list: data };
            const xhttp = new XMLHttpRequest();
            xhttp.onreadystatechange = function () {
                if (this.readyState == 4) {
                    var ret = null;
                    if (this.status == 200 && this.responseText) {
                        try {
                            ret = JSON.parse(this.responseText);
                        } catch (e) {
                            console.error(e);
                        }
                    }
    
                    if (ret) {
                        callback(ret);
                    } else {
                        callback({ code: 100, msg: { desc: "Failed", value: null }, data: null });
                    }
                }
            };

            xhttp.open('POST', calcHttpRequestUrlPrefix() + l.UrlUtility.getFullServicesPathV4('/upsellAggregation/footprints/trace'), true);

            if (judgeNowInScSite()) {
                xhttp.withCredentials = true;
            }

            xhttp.setRequestHeader('content-type', 'application/json;charset=UTF-8');
            xhttp.send(JSON.stringify(param));
        } catch(e) {
            callback({ code: 100, msg: { desc: "Failed", value: null }, data: null });
        };
    }

    footprints.push = function() {
        if (footprints.pushing) {
            footprints.repush = true;
            return;
        }
        footprints.pushing = true;

        const list = footprints.getLocalData();
        const sessions = footprints.getPushSessions(); // 需要push的session
        const data = list.filter(v => sessions.includes(v.sessionID)); // 需要push的数据
        const sessionID = footprints.getSessionID(); // 当前sessionID
        const removeData = [];
        if (sessionID) {
            removeData.push(...data); // push的数据需要删除，如果当前session需要push则会包含在此数据中
            removeData.push(...list.filter(v => !sessions.includes(v.sessionID) && sessionID !== v.sessionID)); // 没有push的数据中，删除非当前session的数据
        } else { // 如果当前session不存在，说明全是历史数据，push后全部删
            removeData.push(...list)
        }
        footprints.pushToOrigin(data, ret => {
            if (ret.code == 0) {
                footprints.removeLocalData(removeData);
                footprints.resetPushSession();
            }
            footprints.pushing = false;
            if (footprints.repush) {
                footprints.repush = false;
                footprints.push();
            }
        });
    }

    footprints.realmSites = function() {
        const sites = [];
        for (let i in config.realms) {
            if (config.realms[i].DefaultSiteUrl) {
                sites.push(config.realms[i].DefaultSiteUrl);
            }
        }
        return sites;
    }

    footprints.addCurrentOrigin = function() {
        const origins = footprints.getOrigins();
        if (!origins.includes(location.origin)) {
            origins.push(location.origin);
        }
        footprints.setCookie('eservice_footprints_origins', origins.join(','), 30);
        return origins;
    }

    footprints.getOrigins = function() {
        return (footprints.getCookie('eservice_footprints_origins') || '').split(',').filter(v => !!v);
    }

    footprints.removeOrigin = function(origin) {
        const origins = footprints.getOrigins().filter(v => v !== origin);
        footprints.setCookie('eservice_footprints_origins', origins.join(','), 30);
        return origins;
    }
 
    footprints.initEachOrigins = function() {
        const realmSites = footprints.realmSites();
        const origins = footprints.getOrigins().filter(v => realmSites.includes(v)).filter(v => v !== location.origin);
        if (origins.length == 0) {
            return;
        }

        if (!footprints.initedOriginIframes) {
            footprints.initedOriginIframes = [];
        }
        if (!footprints.initedOrigins) {
            footprints.initedOrigins = [];
        }

        if (!footprints.receiveMessageInited) {
            footprints.receiveMessageInited = true;
            window.addEventListener('message', function(event) {
                if (event.data && event.data.type === 'eSupportFootprintsIframe' && event.data.key === 'eservice_footprints_data' && event.data.value ) {
                    footprints.addLocalData(JSON.parse(event.data.value), true);
                    if (footprints.initedOrigins && footprints.initedOriginIframes) {
                        const index = footprints.initedOrigins.indexOf(event.origin);
                        const iframe = footprints.initedOriginIframes[index];
                        iframe.contentWindow.postMessage({ type: 'remove', key: 'eservice_footprints_data' }, '*');
                    }
                    const retainOrigins = footprints.removeOrigin(event.origin).filter(v => realmSites.includes(v)).filter(v => v !== location.origin);
                    if (retainOrigins.length == 0) {
                        footprints.push();
                    }
                }
            });
        }

        for (let i in origins) {
            if (footprints.initedOrigins.includes(origins[i])) {
                continue;
            }
            const iframe = document.createElement('iframe');
            iframe.src = origins[i] + '/api/v4/upsellAggregation/footprints/iframe';
            iframe.style.display = 'none';
            iframe.title = origins[i];
            iframe.name = 'eSupportFootprintsIframe';
            iframe.setAttribute('sandbox', 'allow-scripts allow-forms allow-same-origin');
            iframe.onload = function() {
                try {
                    footprints.addLocalData([{
                        sessionID: footprints.getSessionID(), 
                        timestamp: new Date().getTime(), 
                        debug: JSON.stringify(performance.getEntriesByName(iframe.src).map(v => v.toJSON()))
                    }]);
                } catch(e) {

                }
                iframe.contentWindow.postMessage({ type: 'get', key: 'eservice_footprints_data' }, '*');
            }
            document.body.appendChild(iframe);
            footprints.initedOriginIframes.push(iframe);
            footprints.initedOrigins.push(origins[i]);
        }
    }

    footprints.init = function() {
        if (footprints.isLandingPage() || !footprints.getSessionID()) {
            footprints.newSession();
        }

        footprints.addCurrentOrigin();
        footprints.initEachOrigins();
    
        const overrideFunc = function(originFunc) {
            return function() {
                var result = originFunc.apply(this, arguments);
                footprints.addLocalData(footprints.getCurrentSiteTraces());
                footprints.push();
                return result;
            };
        };

        if (history.pushState) {
            history.pushState = overrideFunc(history.pushState);
        }
        if (history.replaceState) {
            history.replaceState = overrideFunc(history.replaceState);
        }

        footprints.addLocalData([...footprints.getOtherSiteTraces(), ...footprints.getCurrentSiteTraces()]);
        footprints.push();
    }

    footprints.getUserId = function() {
        if (!config || !config.user) {
            return null;
        }
        return config.user.LoggedIn ? config.user.Email : config.user.Id;
    }

    /** 
     * 浏览器加载页面的时间点
     * https://developer.mozilla.org/en-US/docs/Web/API/PerformanceNavigationTiming
     * https://developer.mozilla.org/zh-CN/docs/Web/API/PerformanceTiming
     */
    footprints.getTiming = function() {
        let timing = null;
        if (performance) {
            const list = performance.getEntriesByType("navigation");
            if (list && list.length > 0) {
                timing = list[0];
            }
        }
        if (!timing) {
            return null;
        }
        return JSON.stringify(timing.toJSON());
    }

    footprints.getOtherSiteTraces = function() {
        const data = [];
        const referrerTags = footprints.getReferrerTags();
        if (!footprints.isLandingPage() && document.referrer && !referrerTags.includes('SUPPORT')) { // 非support站点且不是landing page的，记录一条referrer的信息
            data.push({
                index: footprints.nextIndex(),
                sessionID: footprints.getSessionID(), 
                value: document.referrer, 
                timestamp: new Date().getTime(), 
                tags: referrerTags
            });
        }
        return data;
    }

    footprints.getCurrentSiteTraces = function() {
        const source = footprints.getParamValue('source') || footprints.getParamValue('utm_source');
        const subsource = footprints.getParamValue('subsource');

        let tags = [];
        let trafficTags = null;
        let trafficSource = null;
        if (footprints.isLandingPage()) {
            tags.push('LANDING PAGE');
            trafficTags = footprints.getReferrerTags();
            if (source) {
                trafficTags.push('SOURCE_' + source.toUpperCase());
            }
            if (subsource) {
                trafficTags.push('SUBSOURCE_' + subsource.toUpperCase());
            }
            if (document.referrer) {
                trafficSource = document.referrer;
            } else if (source) {
                trafficSource = source.toUpperCase();
            } else if (subsource) {
                trafficSource = subsource.toUpperCase();
            }
        }
        tags.push(...footprints.getPathTags());
        tags.push(...footprints.getSearchTags());
        if (source) {
            tags.push('SOURCE_' + source.toUpperCase());
        }
        if (subsource) {
            tags.push('SUBSOURCE_' + subsource.toUpperCase());
        }

        tags = footprints.distinctArray(tags);

        return [{
            index: footprints.nextIndex(),
            sessionID: footprints.getSessionID(), 
            value: document.URL,
            referrer: document.referrer,
            timestamp: new Date().getTime(),
            orderNumber: footprints.getCookie('eomCurrentOrderNumber'),
            userId: footprints.getUserId(),
            tags: tags,
            keyStep: tags.length > 0,
            hash: location.hash,
            isIframed: top != self,
            trafficTags: trafficTags,
            trafficSource: trafficSource,
            userAgent: navigator.userAgent,
            webdriver: navigator.webdriver,
            cookieEnabled: navigator.cookieEnabled,
            timing: footprints.getTiming()
        }];
    }

    footprints.trace = function(value, tags) {
        if (value && typeof value !== 'string') { 
            try {
                value = JSON.stringify(value);
            } catch (e) {
                value = value.toString();
            }
        }
        tags = tags || [];
        const data = {
            index: footprints.nextIndex(),
            sessionID: footprints.getSessionID(), 
            value: value || "-",
            origin: document.URL,
            timestamp: new Date().getTime(),
            orderNumber: footprints.getCookie('eomCurrentOrderNumber'),
            userId: footprints.getUserId(),
            tags: tags,
            keyStep: tags.length > 0,
            hash: location.hash,
            isIframed: top != self,
            userAgent: navigator.userAgent,
            webdriver: navigator.webdriver,
            cookieEnabled: navigator.cookieEnabled
        };
        footprints.addLocalData([data]);
        footprints.push();
    }

    footprints.isSmokeTest = function() {
        if (footprints.getParamValue('subsource').toLowerCase() === 'smoketest') {
            footprints.setCookie('eservice_footprints_is_smoketest', 'true');
            return true;
        }
        return footprints.getCookie('eservice_footprints_is_smoketest') === 'true';
    }

    if (
        !footprints.isSmokeTest() // 忽略smoke test
        && 
        (!frameElement || frameElement.name !== 'eSupportFootprintsIframe') // 防止循环嵌套
        ) {
        footprints.init();
    }

})(footprints);

window.footprints = footprints;
