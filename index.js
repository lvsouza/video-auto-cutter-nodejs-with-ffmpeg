#!/usr/bin/env node

import { currentStatus, logRunner, segmentStatus } from './logRunner.js';
import { mergeSegments } from './mergeSegments.js';
import { getSegments } from './getSegments.js';
import { cutSegments } from './cutSegments.js';
import { selectVideos } from './listVideos.js';
import { getPaths } from './getPath.js';

const [originalPath] = process.argv.slice(2);
if (!originalPath) {
  throw new Error("Path with problem");
}

await selectVideos(originalPath)
  .then(async videos => {
    currentStatus.totalOfVideosReady = 0;
    currentStatus.totalOfVideos = videos.length;

    for (const videoPath of videos) {
      currentStatus.step = 0;

      const { inputPathVideo, outputPathVideo, tmpPath, tmpPathFFMPEGMergeFile, inputFileName, outputFileName } = getPaths(videoPath);


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

      currentStatus.totalOfVideosReady++;
    }
  });


