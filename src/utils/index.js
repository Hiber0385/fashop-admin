import { message, Modal } from 'antd';
import stateHoc from './stateHoc';
import Fetch from './fetch';
import { initLibraryConfigFunc } from "ws-web-utils";
import { publicFunction as nativePublicFunction } from "ws-web-utils";
import { AppName, AppPlatform, errorCollectApi, env } from "../config/root";
import store from "../store";
import imageUpload from "./imageUpload";
import { parse, stringify } from 'qs';
export { fetchStatus, storageModule } from "ws-web-utils";
const publicFunction = {
    ...nativePublicFunction,
    ...{
        unique,
        type,
    }
}
const getHeaders = () => {
    const { member } = store.getState().app
    const { userInfo } = member
    return {
        'User-Id': userInfo ? userInfo.user_id : null,
        'Access-Token': userInfo ? userInfo.access_token : null,
    }
}

function unique(arr) {
    const seen = new Map()
    return arr.filter((a) => !seen.has(a) && seen.set(a, 1))
}

function type(o) {
    var s = Object.prototype.toString.call(o);
    return s.slice(s.indexOf(" ") + 1, s.length - 1).toLowerCase();
}

initLibraryConfigFunc({
    Toast: {
        info: (content, duration, onClose) => {
            message.info(content, duration, onClose)
        },
        error: (content, duration, onClose) => {
            message.error(content, duration, onClose)
        },
        warning: (content, duration, onClose) => {
            message.warning(content, duration, onClose)
        },
        hide: () => {
            message.destroy()
        },
        loading: (content, duration, onClose) => {
            message.loading(content, duration, onClose)
        },
    },
    Modal: {
        alert: (title, content, array) => {
            Modal.confirm({
                title,
                content,
                okText: array[1].text,
                okType: 'danger',
                cancelText: array[0].text,
                onOk() {
                    array[0].onPress()
                },
                onCancel() {
                    array[1].onPress()
                },
            })
        },
        info: ({ title, content, onOk }) => {
            Modal.info({
                title,
                content,
                onOk,
            })
        },
        success: ({ title, content, onOk }) => {
            Modal.success({
                title,
                content,
                onOk,
            })
        },
        error: ({ title, content, onOk }) => {
            Modal.error({
                title,
                content,
                onOk,
            })
        },
        warning: ({ title, content, onOk }) => {
            Modal.warning({
                title,
                content,
                onOk,
            })
        },
    },
    getLogin: () => {
        const { member } = store.getState().app
        const { login } = member
        return login
    },
    pushLogin: () => {
        // const resetAction = NavigationActions.navigate({ routeName: 'UserLogin'})
        // store.dispatch(resetAction)
    },
    APP_ROOT_CONFIG: {
        AppName,
        AppPlatform,
        errorCollectApi,
        env,
    },
    removeUserInfo: () => {
        // store.dispatch(userSignOut())
    },
    showLoading: () => {
        // store.dispatch(setIsShowFetchLoading(true))
        message.loading('loading...', 0)
    },
    hideLoading: () => {
        // store.dispatch(setIsShowFetchLoading(false))
        message.destroy()
    },
    getHeaders,
})

function getRelation(str1, str2) {
    if (str1 === str2) {
        console.warn('Two path are equal!'); // eslint-disable-line
    }
    const arr1 = str1.split('/');
    const arr2 = str2.split('/');
    if (arr2.every((item, index) => item === arr1[index])) {
        return 1;
    } else if (arr1.every((item, index) => item === arr2[index])) {
        return 2;
    }
    return 3;
}

function getRenderArr(routes) {
    let renderArr = [];
    renderArr.push(routes[0]);
    for (let i = 1; i < routes.length; i += 1) {
        // 去重
        renderArr = renderArr.filter(item => getRelation(item, routes[i]) !== 1);
        // 是否包含
        const isAdd = renderArr.every(item => getRelation(item, routes[i]) === 3);
        if (isAdd) {
            renderArr.push(routes[i]);
        }
    }
    return renderArr;
}

/**
 * Get router routing configuration
 * { path:{name,...param}}=>Array<{name,path ...param}>
 * @param {string} path
 * @param {routerData} routerData
 */
function getRoutes(path, routerData) {
    let routes = Object.keys(routerData).filter(
        routePath => routePath.indexOf(path) === 0 && routePath !== path
    );
    // Replace path to '' eg. path='user' /user/name => name
    routes = routes.map(item => item.replace(path, ''));
    // Get the route to be rendered to remove the deep rendering
    const renderArr = getRenderArr(routes);
    // Conversion and stitching parameters
    return renderArr.map(item => {
        const exact = !routes.some(route => route !== item && getRelation(route, item) === 1);
        return {
            exact,
            ...routerData[`${path}${item}`],
            key: `${path}${item}`,
            path: `${path}${item}`,
        };
    });
}


function getPageQuery() {
    return parse(window.location.href.split('?')[1]);
}

function getQueryPath(path = '', query = {}) {
    const search = stringify(query);
    if (search.length) {
        return `${path}?${search}`;
    }
    return path;
}


/* eslint no-useless-escape:0 */
const reg = /(((^https?:(?:\/\/)?)(?:[-;:&=\+\$,\w]+@)?[A-Za-z0-9.-]+(?::\d+)?|(?:www.|[-;:&=\+\$,\w]+@)[A-Za-z0-9.-]+)((?:\/[\+~%\/.\w-_]*)?\??(?:[-\+=&;%@.\w_]*)#?(?:[\w]*))?)$/;

function isUrl(path) {
    return reg.test(path);
}

export {
    stateHoc,
    Fetch,
    imageUpload,
    publicFunction,
    getHeaders,
    getRoutes,
    getPageQuery,
    getQueryPath,
    isUrl
}
