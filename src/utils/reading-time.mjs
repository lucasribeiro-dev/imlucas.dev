import getReadingTime from 'reading-time';
import { toString } from 'mdast-util-to-string';

export default function remarkReadingTime() {
  return (tree, { data }) => {
    const text = toString(tree);
    const result = getReadingTime(text);
    data.astro.frontmatter.minutesRead = result.text;
  };
}
