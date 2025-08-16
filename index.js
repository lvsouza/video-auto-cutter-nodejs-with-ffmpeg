import { mergeSegments } from './mergeSegments.js';
import { getSegments } from './getSegments.js';
import { cutSegments } from './cutSegments.js';


const inputPathVideo = "./entrada.mkv";
const outputPathVideo = "./saida.mkv";
const tmpPath = "./tmp";
const tmpPathFFMPEGMergeFile = "./temp_segments_list.txt";


const segments = getSegments(inputPathVideo, 100, -50);

const segmentsWithSegmentPath = await cutSegments(inputPathVideo, tmpPath, segments);


console.log(segments);
console.log(segmentsWithSegmentPath);



mergeSegments(segmentsWithSegmentPath, outputPathVideo, tmpPathFFMPEGMergeFile)
