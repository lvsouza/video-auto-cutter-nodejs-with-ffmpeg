import path from 'path';


export const getPaths = (filePath) => {
  const inputFileData = path.parse(filePath);

  const tmpPath = path.join(inputFileData.dir, 'tmp');
  const tmpPathFFMPEGMergeFile = path.join(inputFileData.dir, `temp_segments_list.txt`);
  const inputPathVideo = path.join(inputFileData.dir, `${inputFileData.name}${inputFileData.ext}`);
  const outputPathVideo = path.join(inputFileData.dir, `AUTOCUT.${inputFileData.name}${inputFileData.ext}`);

  return {
    tmpPath,
    inputPathVideo,
    outputPathVideo,
    tmpPathFFMPEGMergeFile,
    inputFileName: `${inputFileData.name}${inputFileData.ext}`,
    outputFileName: `AUTOCUT.${inputFileData.name}${inputFileData.ext}`,
  }
}
