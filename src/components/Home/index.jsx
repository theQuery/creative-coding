import './index.css';
import projects from '../../projects';
import Canvas from '../Canvas';
import Paragraph from '../Paragraph';
import Plate from '../Plate';

function Home() {
  return <div className='home'>
    <Canvas />
    <div className='home__content'>
      <div className='home__text'>
        <h1 className='home__title'>
          <span className='home__title-top'>Creative</span>
          <span className='home__title-bottom'>
            Coding <span>by tmk</span>
          </span>
        </h1>
        <Paragraph />
      </div>
      <div className='home__projects'>
        {Object.values(projects).map(project => {
          return <Plate key={project.link} project={project} />
        })}
      </div>
    </div>
  </div>
}

export default Home;