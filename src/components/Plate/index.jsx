import './index.css';

function Plate({ label, description, link }) {
  return <button className='plate' data-link={link}>
    <h2 className='plate__label'>{label}</h2>
    <p className='plate__description'>{description}</p>
  </button>
}

export default Plate;