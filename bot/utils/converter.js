import dotenv from 'dotenv'
import {
  GetSupportedConversionTypesRequest,
  InfoApi,
  FileApi,
  ConvertApi,
  ConvertSettings,
  ConvertDocumentRequest,
  UploadFileRequest,
  DownloadFileRequest
} from 'groupdocs-conversion-cloud'
import { saveAndSendConvertedDocument } from './saveAndSendPhoto.js'
import fs from 'fs'
import { loaderOn } from './loader.js'

dotenv.config({ path: '../../../.env' })

export class Converter {
  constructor(filepath) {
    this.api = InfoApi.fromKeys(process.env.CONVERTER_SID, process.env.CONVERTER_KEY)
    this.apiConvert = ConvertApi.fromKeys(process.env.CONVERTER_SID, process.env.CONVERTER_KEY)    // this.filepath = filepath
    this.apiFile = FileApi.fromKeys(process.env.CONVERTER_SID, process.env.CONVERTER_KEY)
  }

  async getSupportedConversionTypes() {
    const request = new GetSupportedConversionTypesRequest()
    let formats = []
    return this.api.getSupportedConversionTypes(request)
      .then((result) => {
        formats = result
        console.log('Supported file-formats:')
        result.forEach((format) => {
          console.log(format.sourceFormat + ': [' + format.targetFormats.join(', ') + ']')
        })
        return formats
      })
  }

  async getConverter(filePath, format) {
    let settings = new ConvertSettings()
    settings.filePath = filePath
    settings.format = format
    settings.outputPath = 'converted'

    return this.apiConvert.convertDocument(new ConvertDocumentRequest(settings)).then(res => {
      console.log('res', res)
      return res
    }).catch(err => {
      console.log('err', err)
    })
  }

  async getDownload(filePath, fileName, chatID, bot, waitingID) {
    let res = new DownloadFileRequest(filePath)
    await this.apiFile.downloadFile(res)
      .then(function(response) {
        loaderOn('81%', bot, chatID, waitingID)
        console.log('Expected response type is Stream: ' + response.length)
        return saveAndSendConvertedDocument(fileName, response, chatID, bot, waitingID)
      })
      .catch(function(error) {
        console.log('Error: ' + error.message)
      })
  }

  async getUpload(resourcesFolder) {
    // const resourcesFolder = 'conversions/caf.pdf'
    fs.readFile(resourcesFolder, (err, fileStream) => {
      const request = new UploadFileRequest(resourcesFolder, fileStream)
      this.apiFile.uploadFile(request)
        .then(function(response) {
          console.log('🟩Expected response type is FilesUploadResult: ' + response.uploaded.length)
        })
        .catch(function(error) {
          console.log('Error: ' + error.message)
        })
    })
  }
}
