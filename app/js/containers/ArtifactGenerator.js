// ----------------------------------------------------------------------------
// Copyright (c) 2016-2020, QIIME 2 development team.
//
// Distributed under the terms of the Modified BSD License.
//
// The full license is in the file LICENSE, distributed with this software.
// ----------------------------------------------------------------------------

import { connect } from 'react-redux';

import actions from '../actions';
import ArtifactGenerator from '../components/ArtifactGenerator';

const mapStateToProps = ({ tabState: { createArtifact: { currentIndex } }, ...state }) => ({
    sysPath: state.artifacts.sysCreationPath,
    importableTypes: state.superTypes.importableTypes,
    importableFormats: state.superTypes.importableFormats,
    active: currentIndex
});

const mapDispatchToProps = dispatch => ({
    toggleCreation: idx => dispatch(actions.changeTab('createArtifact', (idx + 1) % 2)),
    selectDirectory: () => dispatch(actions.selectArtifactDirectory()),
    createArtifact: (e, idx) => {
        e.preventDefault();
        const fd = new FormData(e.target);
        // Set default for source_format, in case not present in form data
        const data = { source_format: null };
        for (const [key, value] of fd) {
            if (key === 'source_format' && value === '') {
                data[key] = null;
            } else if (value === '' || value === undefined) {
                alert(`${key} must not be blank!`);
                return false;
            } else data[key] = value;
        }
        dispatch(actions.createArtifact(data));
        dispatch(actions.changeTab('createArtifact', (idx + 1) % 2));
        return true;
    }
});


export default connect(
    mapStateToProps,
    mapDispatchToProps
)(ArtifactGenerator);
