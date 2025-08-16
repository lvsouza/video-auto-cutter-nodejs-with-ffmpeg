import { mergeSegments } from './mergeSegments.js';
import { getSegments } from './getSegments.js';
import { cutSegments } from './cutSegments.js';
import { getPaths } from './getPath.js';

const [originalPath] = process.argv.slice(2);
if (!originalPath) {
  throw new Error("Path with problem");
}

const { inputPathVideo, outputPathVideo, tmpPath, tmpPathFFMPEGMergeFile } = getPaths(originalPath);


console.log('Analisando segmentos necessários');
const segments = getSegments(inputPathVideo, 100, -40);
console.log('Segmentos necessários:', segments.length);
segments.forEach((segment, index) => {
  console.log(`Segment ${index + 1}:`, 'start:', segment.start.toFixed(2), 'end:', segment.end.toFixed(2), 'duration:', segment.duration);
})


console.log('Criando segmentos no disco');
const [segmentsWithSegmentPath, clearTemp] = await cutSegments(inputPathVideo, tmpPath, segments, 5);
segmentsWithSegmentPath.forEach((segmentWithPath, index) => {
  console.log(`Segment ${index + 1}:`, 'start:', segmentWithPath.start.toFixed(2), 'end:', segmentWithPath.end.toFixed(2), 'duration:', segmentWithPath.duration, 'path:', segmentWithPath.path);
})


console.log('Criando merge de segmentos');
mergeSegments(segmentsWithSegmentPath, outputPathVideo, tmpPathFFMPEGMergeFile)
console.log('Merge de segmentos completo');

console.log('Limpando a pasta temporária');
await clearTemp()
console.log('Pasta temporária limpa');
