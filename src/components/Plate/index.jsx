import './index.css';

function Plate({ project }) {
  return <button className='plate' data-link={project.link}>
    <h2 className='plate__label'>{project.name}</h2>
    <p className='plate__description'>{project.desc}</p>
  </button>
}

export default Plate;