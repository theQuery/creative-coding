import './index.css';
import { useState } from 'react';
import { useParams, Navigate } from 'react-router-dom';
import projects from '../../projects';
import BackIcon from '../../assets/back.svg?react';
import SoundOnIcon from '../../assets/sound-on.svg?react';
import SoundOffIcon from '../../assets/sound-off.svg?react';
import CodeIcon from '../../assets/code.svg?react';
import InfoIcon from '../../assets/info.svg?react';

function Project() {
  const [isSoundEnabled, setIsSoundEnabled] = useState(false);
  const { projectId } = useParams();
  const project = projects[projectId];

  function handleSound() {
    setIsSoundEnabled(oldIsSoundEnabled => !oldIsSoundEnabled);
  }

  function handleCode() {
    window.open(project.code, '_blank');
  }

  if (!project) return <Navigate replace to='/' />

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