import { async } from 'regenerator-runtime';
import { TIMEOUT_SEC } from './config.js';

const timeout = function (sec) {
    return new Promise(function (_, reject) {
        setTimeout(function () {
            reject(new Error(`Request took too long! Timeout after ${sec} second`));
        }, sec * 1000);
    });
};

export const AJAX = async function (url, uploadData = undefined) {
    try {
        const fetchPro = uploadData ? fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(uploadData),
        }) : fetch(url);

        const response = await Promise.race([
            fetchPro,
            timeout(TIMEOUT_SEC),
        ]);

        const data = await response.json();

        if (!response.ok) throw new Error(`Status Code ${response.status}: ${data.message}`);
        return data;
    } catch (error) {
        throw error;
    }
};

/*
// Refactore => create 1 function AJAX

export const getJSON = async function (url) {
    try {
        const fetchPro = fetch(url);
        const response = await Promise.race([
            fetchPro,
            timeout(TIMEOUT_SEC),
        ]);

        const data = await response.json();

        if (!response.ok) throw new Error(`Status Code ${response.status}: ${data.message}`);
        return data;
    } catch (error) {
        throw error;
    }
};

export const sendJSON = async function (url, uploadData) {
    try {
        const fetchPro = fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(uploadData),
        });

        const response = await Promise.race([
            fetchPro,
            timeout(TIMEOUT_SEC),
        ]);

        const data = await response.json();

        if (!response.ok) throw new Error(`Status Code ${response.status}: ${data.message}`);
        return data;
    } catch (error) {
        throw error;
    }
};
*/

export const notReloadPage = function () {
    if (module.hot) {
        module.hot.accept()
    }
};
