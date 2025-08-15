import { getSegments } from './getSegments.js';
import { cutSegments } from './cutSegments.js';


const pathVideo = "./entrada.mkv";
const tmpPath = "./tmp";


const segments = getSegments(pathVideo);

const segmentsWithSegmentPath = await cutSegments(pathVideo, tmpPath, segments);




console.log(segments);
console.log(segmentsWithSegmentPath);
