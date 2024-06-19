import './index.css';
import Canvas from '../Canvas';
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
        <p className='home__description'>
          Unveil a collection of visions, each one woven from the dreams
          of a lonely node in the boundless void of the universe's mind.
        </p>
      </div>
      <div className='home__projects'>
        <Plate
          label='Space Soarer'
          description='Journey through the boundless expanse of space by pressing the W and Shift keys.'
          link='/space-soarer'
        />
        <Plate
          label='Magic Wand'
          description='Wave a magic wand and click to conjure vibrant explosions of color.'
          link='/magic-wand'
        />
        <Plate
          label='Piano Orbs'
          description='Witness glowing orbs dancing across your screen, creating a symphony of colors and melodies.'
          link='/piano-orbs'
        />
      </div>
    </div>
  </div>
}

export default Home;