import './index.css';
import { useState } from 'react';
import { useParams, Navigate } from 'react-router-dom';
import BackIcon from '../../assets/back.svg?react';
import SoundOnIcon from '../../assets/sound-on.svg?react';
import SoundOffIcon from '../../assets/sound-off.svg?react';
import CodeIcon from '../../assets/code.svg?react';
import InfoIcon from '../../assets/info.svg?react';
import SpaceSoarer from '../../projects/SpaceSoarer';
import MagicWand from '../../projects/MagicWand';
import PianoOrbs from '../../projects/PianoOrbs';

const projects = {
  'space-soarer': {
    name: 'Space Soarer',
    code: 'https://github.com/theQuery/creative-coding/tree/main/src/projects/SpaceSoarer',
    info: 'Press W to move forward and Shift to boost.',
    date: 'May 21st, 2024',
    component: SpaceSoarer
  },
  'magic-wand': {
    name: 'Magic Wand',
    code: 'https://github.com/theQuery/creative-coding/tree/main/src/projects/MagicWand',
    info: 'Click to cast a spell.',
    date: 'May 18th, 2024',
    component: MagicWand
  },
  'piano-orbs': {
    name: 'Piano Orbs',
    code: 'https://github.com/theQuery/creative-coding/tree/main/src/projects/PianoOrbs',
    info: 'Watch the orbs play notes as they hit the walls.',
    date: 'February 11th, 2024',
    component: PianoOrbs
  }
};

function Project() {
  const [isSoundEnabled, setIsSoundEnabled] = useState(false);
  const { projectId } = useParams();
  const project = projects[projectId];

  if (!project) return <Navigate replace to='/' />

  function handleSound() {
    setIsSoundEnabled(oldIsSoundEnabled => !oldIsSoundEnabled);
  }

  function handleCode() {
    window.open(project.code, '_blank');
  }

  return <div className='project'>
    <div className='project__component'><project.component /></div>
    <div className='project__navbar'>
      <div className='project__buttons'>
        <button data-link='/'><BackIcon /></button>
        <button onClick={handleSound} data-sound={isSoundEnabled}>
          {isSoundEnabled ? <SoundOnIcon /> : <SoundOffIcon />}
        </button>
        <button onClick={handleCode}><CodeIcon /></button>
        <button data-info={project.info}><InfoIcon /></button>
      </div>
      <h1 className='project__name'>{project.name}</h1>
    </div>
  </div>
}

export default Project;