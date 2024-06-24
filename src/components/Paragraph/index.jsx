import './index.css';
import { useState, useRef, useEffect } from 'react';
import ReplayIcon from '../../assets/replay.svg?react';
import NextIcon from '../../assets/next.svg?react';
import EnterIcon from '../../assets/enter.svg?react';
import getRandInt from '../../utils/getRandInt';

const paragraphs = [
  "Dive into a world where code meets creativity. This website is a vibrant collection of my interactive canvas projects, each meticulously crafted to bring art and technology together in mesmerizing harmony.",
  "Explore a diverse range of visual experiences, from generative art and algorithmic animations to dynamic data visualizations and playful experiments. Each project is a testament to the endless possibilities of creative coding, showcasing the beauty and innovation that can be achieved through programming.",
  "Whether you're a fellow coder, a digital artist, or simply an admirer of the digital arts, I invite you to explore, interact, and be inspired by these creations. Thank you for visiting, and enjoy your journey through my creative coding showcase.",
  "Signed by yours truly, Tom Morgenshtern Kristoffersen."
];

function Paragraph() {
  const [paragraphText, setParagraphText] = useState('');
  const [paragraphIndex, setParagraphIndex] = useState(0);
  const paragraphRef = useRef(null);
  const buttonRef = useRef(null);
  const timeoutRef = useRef(null);
  const paragraph = paragraphs[paragraphIndex];

  useEffect(() => {
    const keyframes = [{ translate: '0 0', opacity: 1, scale: 1 }];
    const timing = { fill: 'forwards' };
    paragraphRef.current.animate(keyframes, timing);

    const letters = paragraph.split('');
    addLetterToParagraph(letters);

    return () => {
      clearTimeout(timeoutRef.current);
      setParagraphText('');
    };
  }, [paragraph]);

  useEffect(() => {
    window.addEventListener('keydown', handleKeydown);
    return () => window.removeEventListener('keydown', handleKeydown);
  }, [handleKeydown]);

  function handleKeydown(event) {
    if (event.key !== 'Enter') return;

    const isOnButton = event.target.isEqualNode(buttonRef.current);
    const isOnBody = event.target.isEqualNode(document.body);
    if (!isOnButton && !isOnBody) return;

    event.preventDefault();
    showFullOrNextParagraph();
  }

  function handleClick(event) {
    event.stopPropagation();
    showFullOrNextParagraph();
  }

  function showFullOrNextParagraph() {
    getIsFullParagraph() ? showNextParagraph() : showFullParagraph();
  }

  function showFullParagraph() {
    setParagraphText(paragraph);
  }

  function showNextParagraph() {
    const duration = 200;
    const keyframes = [{
      opacity: 0,
      translate: getIsLastParagraph() ? '-100% -100%' : '0 -100%',
      scale: getIsLastParagraph() ? 0 : 1,
    }];
    const timing = { duration, fill: 'forwards' };
    paragraphRef.current.animate(keyframes, timing);

    setTimeout(() => {
      setParagraphIndex(oldParagraphIndex => {
        return getIsLastParagraph(oldParagraphIndex)
          ? 0 : ++oldParagraphIndex;
      });
    }, duration);
  }

  function getIsLastParagraph(index = paragraphIndex) {
    return index === paragraphs.length - 1;
  }

  function getIsFullParagraph(text = paragraphText) {
    return text.length === paragraph.length;
  }

  function addLetterToParagraph(letters) {
    const delay = getRandInt(0, 15)
      ? getRandInt(10, 50) : getRandInt(50, 500);

    timeoutRef.current = setTimeout(() => {
      const letter = letters.shift();

      setParagraphText(oldParagraphText => {
        if (getIsFullParagraph(oldParagraphText)) {
          clearTimeout(timeoutRef.current);
          return oldParagraphText;
        } else {
          return oldParagraphText + letter;
        }
      });

      addLetterToParagraph(letters);
    }, delay);
  }

  return <div className='paragraph'>
    <p className='paragraph__text' ref={paragraphRef}>
      <button
        className='paragraph__button'
        ref={buttonRef}
        onClick={handleClick}
      >
        {getIsFullParagraph()
          ? getIsLastParagraph() ? <ReplayIcon /> : <NextIcon />
          : <EnterIcon />}
      </button>
      {paragraphText}
    </p>
  </div>
}

export default Paragraph;