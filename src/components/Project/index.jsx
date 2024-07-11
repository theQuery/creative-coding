import './index.css';
import { useState } from 'react';
import { useParams, Navigate } from 'react-router-dom';
import projects from '../../projects';
import BackIcon from '../../assets/back.svg?react';
import ReloadIcon from '../../assets/reload.svg?react';
import SoundOnIcon from '../../assets/sound-on.svg?react';
import SoundOffIcon from '../../assets/sound-off.svg?react';
import CodeIcon from '../../assets/code.svg?react';
import InfoIcon from '../../assets/info.svg?react';
import PreviousIcon from '../../assets/previous.svg?react';
import NextIcon from '../../assets/next.svg?react';

function Project() {
  const [reloadKey, setReloadKey] = useState(false);
  const [isSoundEnabled, setIsSoundEnabled] = useState(false);
  const { projectId } = useParams();
  const project = projects[projectId];
  const previousProject = getPreviousProject();
  const nextProject = getNextProject();

  function handleReload() {
    setReloadKey(oldReloadKey => !oldReloadKey);
  }

  function handleSound() {
    setIsSoundEnabled(oldIsSoundEnabled => !oldIsSoundEnabled);
  }

  function handleCode() {
    window.open(project.code, '_blank');
  }

  function getPreviousProject() {
    const projectIds = Object.keys(projects);
    const lastProjectIndex = projectIds.length - 1;
    let previousProjectIndex = project.index - 1;

    previousProjectIndex = previousProjectIndex < 0
      ? lastProjectIndex : previousProjectIndex;

    const previousProjectId = projectIds[previousProjectIndex];
    return projects[previousProjectId];
  }

  function getNextProject() {
    const projectIds = Object.keys(projects);
    const lastProjectIndex = projectIds.length - 1;
    let nextProjectIndex = project.index + 1;

    nextProjectIndex = nextProjectIndex > lastProjectIndex
      ? 0 : nextProjectIndex;

    const nextProjectId = projectIds[nextProjectIndex];
    return projects[nextProjectId];
  }

  if (!project) return <Navigate replace to='/' />

  return <div className='project'>
    <div className='project__component'>
      <project.component key={reloadKey} />
    </div>
    <div className='project__navbar'>
      <div className='project__buttons'>
        <button data-link='/'><BackIcon /></button>
        <button onClick={handleReload}><ReloadIcon /></button>
        <button onClick={handleSound} data-sound={isSoundEnabled}>
          {isSoundEnabled ? <SoundOnIcon /> : <SoundOffIcon />}
        </button>
        <button onClick={handleCode}><CodeIcon /></button>
        <button data-info={project.info}><InfoIcon /></button>
      </div>
      <div className='project__picker'>
        <button data-link={previousProject.link}><PreviousIcon /></button>
        <h1 className='project__name'>{project.name}</h1>
        <button data-link={nextProject.link}><NextIcon /></button>
      </div>
    </div>
  </div>
}

export default Project;