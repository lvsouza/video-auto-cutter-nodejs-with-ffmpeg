#!/usr/bin/env node

import { currentStatus, logRunner, segmentStatus } from './logRunner.js';
import { mergeSegments } from './mergeSegments.js';
import { getSegments } from './getSegments.js';
import { cutSegments } from './cutSegments.js';
import { getPaths } from './getPath.js';

const [originalPath] = process.argv.slice(2);
if (!originalPath) {
  throw new Error("Path with problem");
}


const { inputPathVideo, outputPathVideo, tmpPath, tmpPathFFMPEGMergeFile, inputFileName, outputFileName } = getPaths(originalPath);


logRunner(inputFileName, outputFileName)

const segments = getSegments(inputPathVideo, 100, -40);
segmentStatus.message = `0/${segments.length}`;
currentStatus.step++;

const [segmentsWithSegmentPath, clearTemp] = await cutSegments(inputPathVideo, tmpPath, segments, 5, segmentStatus);
currentStatus.step++;

mergeSegments(segmentsWithSegmentPath, outputPathVideo, tmpPathFFMPEGMergeFile)
currentStatus.step++;

await clearTemp()
currentStatus.step++;
