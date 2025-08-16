import path from 'path';


export const getPaths = (filePath) => {
  const inputFileData = path.parse(filePath);

  const tmpPath = path.join(inputFileData.dir, 'tmp');
  const tmpPathFFMPEGMergeFile = path.join(inputFileData.dir, `temp_segments_list.txt`);
  const inputPathVideo = path.join(inputFileData.dir, `${inputFileData.name}${inputFileData.ext}`);
  const outputPathVideo = path.join(inputFileData.dir, `RAW-CUTS.${inputFileData.name}${inputFileData.ext}`);

  return {
    tmpPath,
    tmpPathFFMPEGMergeFile,
    inputPathVideo,
    outputPathVideo,
  }
}
