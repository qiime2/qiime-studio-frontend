// ----------------------------------------------------------------------------
// Copyright (c) 2016-2017, QIIME 2 development team.
//
// Distributed under the terms of the Modified BSD License.
//
// The full license is in the file LICENSE, distributed with this software.
// ----------------------------------------------------------------------------

import { remote } from 'electron';

import { refreshArtifacts, refreshVisualizations, refreshMetadata } from './artifacts';
import { fetchAPI } from '../util/auth';


export const directoryChange = (directory) => {
    return (dispatch, getState) => {
        const { connection: { uri, secretKey } } = getState();
        const url = `http://${uri}/api/workspace/`;
        const method = 'PUT';
        fetchAPI(secretKey, method, url, { workspace: directory })
            .then(() => dispatch({
                type: 'DIRECTORY_CHANGE',
                directory
            }))
            .then(() => dispatch(refreshArtifacts()))
            .then(() => dispatch(refreshVisualizations()))
            .then(() => dispatch(refreshMetadata()));
    };
};


export const directoryChangeDialog = (currPath) => {
    return (dispatch) => {
        remote.dialog.showOpenDialog({
            title: 'Choose Directory',
            defaultpath: currPath,
            buttonlabel: 'Set Directory',
            properties: ['openDirectory']
        }, (fps) => {
            if (fps) {
                dispatch(directoryChange(fps[0]));
            }
        });
    };
};

const setArtifactDir = path => ({
    type: 'SET_ARTIFACT_PATH',
    path
});

export const selectArtifactDirectory = () => {
    return (dispatch, getState) => {
        const currPath = getState().currentDirectory;
        let curProps = ['openFile', 'openDirectory'];
        let curTitle = 'Choose Artifact Directory or File';
        const openSelectArtifactDirectoryDialog = () => {
            remote.dialog.showOpenDialog({
                title: curTitle,
                defaultpath: currPath,
                properties: curProps
            }, (fps) => {
                if (fps) {
                    dispatch(setArtifactDir(fps[0]));
                }
            });
        };
        if (process.platform !== 'darwin') {
            // linux or windows
            remote.dialog.showMessageBox({
                type: 'question',
                buttons: ['File', 'Directory', 'Cancel'],
                title: 'Artifact Selection',
                message: 'What would you like to select?',
                calcelId: 2
            }, (callback) => {
                remote.dialog.showErrorBox(callback.response);
                if (callback.response === 0) {
                    curProps = ['openFile'];
                    curTitle = 'Choose Artifact File';
                    dispatch(openSelectArtifactDirectoryDialog());
                } else if (callback.response === 1) {
                    curProps = ['openDirectory'];
                    curTitle = 'Choose Artifact Directory';
                    dispatch(openSelectArtifactDirectoryDialog());
                }
            });
        } else dispatch(openSelectArtifactDirectoryDialog());
    };
};
