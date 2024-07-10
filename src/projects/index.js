import getTitleCase from '../utils/getTitleCase';
import SpaceSoarer from './SpaceSoarer';
import MagicWand from './MagicWand';
import PianoOrbs from './PianoOrbs';

const projects = {
    'space-soarer': {
        desc: 'Journey through the boundless expanse of space by pressing the W and Shift keys.',
        info: 'Press W to move forward and Shift to boost.',
        date: 'May 21st, 2024',
        component: SpaceSoarer
    },
    'magic-wand': {
        desc: 'Wave a magic wand and click to conjure vibrant explosions of color.',
        info: 'Click to cast a spell.',
        date: 'May 18th, 2024',
        component: MagicWand
    },
    'piano-orbs': {
        desc: 'Witness glowing orbs dancing across your screen, creating a symphony of colors and melodies.',
        info: 'Watch the orbs play notes as they hit the walls.',
        date: 'February 11th, 2024',
        component: PianoOrbs
    }
};

setProperties();

function setProperties() {
    for (const projectId in projects) {
        setIndex(projectId);
        setLink(projectId);
        setName(projectId);
        setCode(projectId);
    }
}

function setIndex(projectId) {
    const index = Object.keys(projects).indexOf(projectId);
    projects[projectId].index = index;
}

function setLink(projectId) {
    const link = '/' + projectId;
    projects[projectId].link = link;
}

function setName(projectId) {
    const name = getTitleCase(projectId);
    projects[projectId].name = name;
}

function setCode(projectId) {
    const urlSafeName = getTitleCase(projectId).replaceAll(' ', '');
    projects[projectId].code = `https://github.com/theQuery/creative-coding/tree/main/src/projects/${urlSafeName}`;
}

export default projects;