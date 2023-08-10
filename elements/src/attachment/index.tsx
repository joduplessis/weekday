import * as React from "react";
import styled from "styled-components";

const Container = styled.div<{
  preview?: string;
  fullwidth: boolean;
}>`
  background: #F8F9FA;
  border-radius: 10px;
  margin-bottom: 5px;
  margin-right: 5px;
  display: flex;
  flex-direction: column;
  align-items: stretch;
  align-content: center;
  justify-content: flex-start;
  position: relative;
  overflow: hidden;
  width: ${props => props.fullwidth ? "100%" : "300px" };
`;

const ContainerVideo = styled.div`
  width: 100%;
  height: 200px;
`;

const ContainerRow = styled.div`
  flex: 1;
  padding: 7px;
  display: flex;
  flex-direction: row;
  align-items: center;
  align-content: center;
  justify-content: flex-start;
  position: relative;
`;

const Icon = styled.div<{
  color: string,
}>`
  margin-right: 10px;
  background-color: ${props => props.color};
  border-radius: 10px;
  width: 30px;
  height: 30px;
  display: flex;
  flex-direction: row;
  align-items: center;
  align-content: center;
  justify-content: center;
  position: relative;
`;

const Name = styled.div`
  font-weight: 700;
  font-style: normal;
  color: #202529;
  display: inline-block;
  font-size: 12px;
  margin-bottom: 2px;
`;

const Size = styled.div`
  font-weight: 700;
  color: #acb5bd;
  display: inline-block;
  font-size: 8px;
  margin-bottom: 0px;
`;

const Extension = styled.div`
  font-weight: 500;
  font-size: 10px;
  color: #5f6b7a;
  margin-right: 10px;
`;

const Link = styled.div`
  font-weight: 600;
  font-size: 10px;
  cursor: pointer;
  color: #007af5;
  margin-right: 10px;
  cursor: pointer;
  opacity: 1;
  transition: opacity 0.25s;

  &:hover {
    opacity: 0.8;
  }
`;

const Content = styled.div`
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  align-content: flex-start;
  justify-content: flex-start;
  position: relative;
`;

const CloseButton = styled.div`
  cursor: pointer;
  padding: 5px;
  opacity: 1;
  transition: opacity 0.25s;
  position: absolute;
  top: 5px;
  right: 5px;
  z-index: 10;
  display: flex;
  flex-direction: row;
  align-items: center;
  align-content: center;
  justify-content: center;
  border-radius: 50%;

  &:hover {
    opacity: 0.5;
    background-color: rgba(255, 255, 255, 0.25);
  }
`;

const Info = styled.div`
  display: flex;
  flex-direction: row;
  align-items: center;
  align-content: center;
  justify-content: flex-start;
  position: relative;
`;

interface IAttachmentProps {
  /** Full width sizing */
  fullwidth?: boolean;

  /** Size in bytes */
  size?: number;

  /** Preview uri location of file */
  preview?: string;

  /** Uri location of source file */
  uri: string;

  /** File name */
  name: string;

  /** File mime type */
  mime: string;

  /** Callback to parent component */
  onPreviewClick?: any;

  /** Callback to parent component */
  onDeleteClick?: any;
}

const AttachmentComponent: React.FunctionComponent<IAttachmentProps> = (props: IAttachmentProps) => {
  const bytesToSize = (bytes: number) => {
    const sizes: string[] = ["bytes", "kb", "mb", "gb", "tb"];
    if (bytes == 0) return "0 bytes";
    const i: number = Math.floor(Math.log(bytes) / Math.log(1024));
    return Math.round(bytes / Math.pow(1024, i)).toString() + " " + sizes[i];
  };

  const getMimeTypeColor = (type: string) => {
    switch (type.split("/")[0]) {
      case "audio": return "#007af5";
      case "application": return "#36C5AB";
      case "video": return "#EA4E9D";
      case "text": return "#8DA2A5";
      case "image": return "#7A6FF0";
      case "font": return "#E8384F";
      default: return "#007af5";
    }
  };

  const getMimeTypeIcon = (type: string) => {
    switch (type.split("/")[0]) {
      case "audio": return (
        <svg xmlns="http://www.w3.org/2000/svg" width={15} height={15} viewBox="0 0 24 24" style={{ fill: "white", transform: ";-ms-filter:" }}>
          <path d="M16,12V6c0-2.217-1.785-4.021-3.979-4.021c-0.069,0-0.14,0.009-0.209,0.025C9.693,2.104,8,3.857,8,6v6c0,2.206,1.794,4,4,4 S16,14.206,16,12z M10,12V6c0-1.103,0.897-2,2-2c0.055,0,0.109-0.005,0.163-0.015C13.188,4.06,14,4.935,14,6v6c0,1.103-0.897,2-2,2 S10,13.103,10,12z"></path>
          <path d="M6,12H4c0,4.072,3.061,7.436,7,7.931V22h2v-2.069c3.939-0.495,7-3.858,7-7.931h-2c0,3.309-2.691,6-6,6S6,15.309,6,12z"></path>
        </svg>
      );
      case "application": return (
        <svg xmlns="http://www.w3.org/2000/svg" width={15} height={15} viewBox="0 0 24 24" style={{ fill: "white", transform: ";-ms-filter:" }}>
          <path fill="none" d="M4 15v4h16.002L20 15H4zM16 18h-2v-2h2V18zM19 18h-2v-2h2V18zM4 5v4h16.002L20 5H4zM16 8h-2V6h2V8zM19 8h-2V6h2V8z"></path>
          <path d="M20 3H4C2.897 3 2 3.897 2 5v4c0 1.103.897 2 2 2h16c1.103 0 2-.897 2-2V5C22 3.897 21.103 3 20 3zM4 9V5h16l.002 4H4zM20 13H4c-1.103 0-2 .897-2 2v4c0 1.103.897 2 2 2h16c1.103 0 2-.897 2-2v-4C22 13.897 21.103 13 20 13zM4 19v-4h16l.002 4H4z"></path>
          <path d="M17 6H19V8H17zM14 6H16V8H14zM17 16H19V18H17zM14 16H16V18H14z"></path>
        </svg>
      );
      case "video": return (
        <svg xmlns="http://www.w3.org/2000/svg" width={15} height={15} viewBox="0 0 24 24" style={{ fill: "white", transform: ";-ms-filter:" }}>
          <path d="M16,12V6c0-2.217-1.785-4.021-3.979-4.021c-0.069,0-0.14,0.009-0.209,0.025C9.693,2.104,8,3.857,8,6v6c0,2.206,1.794,4,4,4 S16,14.206,16,12z M10,12V6c0-1.103,0.897-2,2-2c0.055,0,0.109-0.005,0.163-0.015C13.188,4.06,14,4.935,14,6v6c0,1.103-0.897,2-2,2 S10,13.103,10,12z"></path>
          <path d="M6,12H4c0,4.072,3.061,7.436,7,7.931V22h2v-2.069c3.939-0.495,7-3.858,7-7.931h-2c0,3.309-2.691,6-6,6S6,15.309,6,12z"></path>
        </svg>
      );
      case "image": return (
        <svg xmlns="http://www.w3.org/2000/svg" width={15} height={15} viewBox="0 0 24 24" style={{ fill: "white", transform: ";-ms-filter:" }}>
          <circle cx="7.499" cy="9.5" r="1.5"></circle><path d="M10.499 14L8.999 12 5.999 16 8.999 16 11.999 16 17.999 16 13.499 10z"></path>
          <path d="M19.999,4h-16c-1.103,0-2,0.897-2,2v12c0,1.103,0.897,2,2,2h16c1.103,0,2-0.897,2-2V6C21.999,4.897,21.102,4,19.999,4z M3.999,18V6h16l0.002,12H3.999z"></path>  
        </svg>
      );
      case "text": return (
        <svg xmlns="http://www.w3.org/2000/svg" width={15} height={15} viewBox="0 0 24 24" style={{ fill: "white", transform: ";-ms-filter:" }}>
          <path d="M11.307,4l-6,16h2.137l1.875-5h6.363l1.875,5h2.137l-6-16H11.307z M10.068,13L12.5,6.515L14.932,13H10.068z"></path>  
        </svg>
      );
      default: return (
        <svg xmlns="http://www.w3.org/2000/svg" width={15} height={15} viewBox="0 0 24 24" style={{ fill: "white", transform: ";-ms-filter:" }}>
          <path d="M12.186,14.552c-0.617,0-0.977,0.587-0.977,1.373c0,0.791,0.371,1.35,0.983,1.35 c0.617,0,0.971-0.588,0.971-1.374C13.163,15.175,12.815,14.552,12.186,14.552z"></path>
          <path d="M14,2H6C4.896,2,4,2.896,4,4v16c0,1.104,0.896,2,2,2h12c1.104,0,2-0.896,2-2V8L14,2z M9.155,17.454 c-0.426,0.354-1.073,0.521-1.864,0.521c-0.475,0-0.81-0.03-1.038-0.06v-3.971c0.336-0.054,0.773-0.083,1.235-0.083 c0.768,0,1.266,0.138,1.655,0.432c0.42,0.312,0.684,0.81,0.684,1.522C9.827,16.59,9.545,17.124,9.155,17.454z M12.145,18 c-1.2,0-1.901-0.906-1.901-2.058c0-1.211,0.773-2.116,1.967-2.116c1.241,0,1.919,0.929,1.919,2.045 C14.129,17.196,13.325,18,12.145,18z M16.8,17.238c0.275,0,0.581-0.061,0.762-0.132l0.138,0.713 c-0.168,0.084-0.546,0.174-1.037,0.174c-1.397,0-2.117-0.869-2.117-2.021c0-1.379,0.983-2.146,2.207-2.146 c0.474,0,0.833,0.096,0.995,0.18l-0.186,0.726c-0.187-0.078-0.444-0.15-0.768-0.15c-0.726,0-1.29,0.438-1.29,1.338 C15.504,16.729,15.984,17.238,16.8,17.238z M14,9c-0.553,0-1,0-1,0V4l5,5H14z"></path>
          <path d="M7.584,14.563c-0.203,0-0.335,0.018-0.413,0.036v2.645c0.078,0.018,0.204,0.018,0.317,0.018 c0.828,0.006,1.367-0.449,1.367-1.415C8.861,15.007,8.37,14.563,7.584,14.563z"></path>
        </svg>
      );
    }
  };

  const getMimeTypeDescription = (type: string) => {
    switch (type) {
      case "audio/aac": return "AAC audio";
      case "application/x-abiword": return "AbiWorddocument";
      case "application/x-freearc": return "Archive document (multiple files embedded)";
      case "video/x-msvideo": return "AVI: Audio Video Interleave";
      case "application/vnd.amazon.ebook": return "Amazon Kindle eBook format";
      case "application/octet-stream": return "Any kind of binary data";
      case "image/bmp": return "Windows OS/2 Bitmap Graphics";
      case "application/x-bzip": return "BZip archive";
      case "application/x-bzip2": return "BZip2 archive";
      case "application/x-csh": return "C-Shell script";
      case "text/css": return "Cascading Style Sheets (CSS)";
      case "text/csv": return "Comma-separated values (CSV)";
      case "application/msword": return "Microsoft Word";
      case "application/vnd.openxmlformats-officedocument.wordprocessingml.document": return "Microsoft Word (OpenXML)";
      case "application/vnd.ms-fontobject": return "MS Embedded OpenType fonts";
      case "application/epub+zip": return "Electronic publication (EPUB)";
      case "application/gzip": return "GZip Compressed Archive";
      case "image/gif": return "Graphics Interchange Format (GIF)";
      case "text/html": return "HyperText Markup Language (HTML)";
      case "image/vnd.microsoft.icon": return "Icon format";
      case "text/calendar": return "iCalendar format";
      case "application/java-archive": return "Java Archive (JAR)";
      case "image/jpeg": return "JPEG images";
      case "text/javascript": return "JavaScript";
      case "application/json": return "JSON format";
      case "application/ld+json": return "JSON-LD format";
      case "audio/midiaudio/x-midi": return "Musical Instrument Digital Interface (MIDI)";
      case "text/javascript": return "JavaScript module";
      case "audio/mpeg": return "MP3 audio";
      case "video/mpeg": return "MPEG Video";
      case "application/vnd.apple.installer+xml": return "Apple Installer Package";
      case "application/vnd.oasis.opendocument.presentation": return "OpenDocument presentation document";
      case "application/vnd.oasis.opendocument.spreadsheet": return "OpenDocument spreadsheet document";
      case "application/vnd.oasis.opendocument.text": return "OpenDocument text document";
      case "audio/ogg": return "OGG audio";
      case "video/ogg": return "OGG video";
      case "application/ogg": return "OGG";
      case "audio/opus": return "Opus audio";
      case "font/otf": return "OpenType font";
      case "image/png": return "Portable Network Graphics";
      case "application/pdf": return "AdobePortable Document Format(PDF)";
      case "appliction/php": return "Hypertext Preprocessor (Personal Home Page)";
      case "application/vnd.ms-powerpoint": return "Microsoft PowerPoint";
      case "application/vnd.openxmlformats-officedocument.presentationml.presentation": return "Microsoft PowerPoint (OpenXML)";
      case "application/x-rar-compressed": return "RAR archive";
      case "application/rtf": return "Rich Text Format (RTF)";
      case "application/x-sh": return "Bourne shell script";
      case "image/svg+xml": return "Scalable Vector Graphics (SVG)";
      case "application/x-shockwave-flash": return "Small web format(SWF) or Adobe Flash document";
      case "application/x-tar": return "Tape Archive (TAR)";
      case "image/tiff": return "Tagged Image File Format (TIFF)";
      case "video/mp2t": return "MPEG transport stream";
      case "font/ttf": return "TrueType Font";
      case "text/plain": return "Text";
      case "application/vnd.visio": return "Microsoft Visio";
      case "audio/wav": return "Waveform Audio Format";
      case "audio/webm": return "WEBM audio";
      case "video/webm": return "WEBM video";
      case "video/mp4": return "Video File";
      case "image/webp": return "WEBP image";
      case "font/woff": return "Web Open Font Format (WOFF)";
      case "font/woff2": return "Web Open Font Format (WOFF)";
      case "application/xhtml+xml": return "XHTML";
      case "application/vnd.ms-excel": return "Microsoft Excel";
      case "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet": return "Microsoft Excel (OpenXML)";
      case "application/xmlifnotreadable from casual users (RFC 3023": return " section 3)";
      case "text/xmlif readable from casual users": return "XML";
      case "application/vnd.mozilla.xul+xml": return "XUL";
      case "application/zip": return "ZIP archive";
      case "audio/3gppif it doesn't contain video": return "3GPPaudio/video container";
      case "audio/3gpp2if it doesn't contain video": return "3GPP2audio/video container";
      case "application/x-7z-compressed": return "7-ziparchive";
      default: return "Document";
    }
  };

  const mimeType = (type: string) => {
    return type.split("/")[0];
  };

  const Preview = () => {
    if (mimeType(props.mime) == "image" && props.preview) {      
      return <img src={props.preview} width="100%" height="auto" />;
    }

    if (mimeType(props.mime) == "video" && props.preview) {
      return (
        <ContainerVideo>
          <video width="100%" height="100%" controls>
            <source src={props.preview} type="video/mp4" />
          </video>
        </ContainerVideo>
      );
    }

    return null;
  };

  // prettier-ignore
  return (
    <Container preview={props.preview} fullwidth={props.fullwidth || false}>
      <Preview />

      {(props.onDeleteClick) &&
        <CloseButton onClick={props.onDeleteClick}>
          <svg 
            xmlns="http://www.w3.org/2000/svg" 
            width="17" 
            height="17" 
            viewBox="0 0 24 24" 
            style={{ fill: "#acb5bd", transform: ";-ms-filter:" }}>
            <path d="M16.192 6.344L11.949 10.586 7.707 6.344 6.293 7.758 10.535 12 6.293 16.242 7.707 17.656 11.949 13.414 16.192 17.656 17.606 16.242 13.364 12 17.606 7.758z"></path>
          </svg>
        </CloseButton>
      }

      <ContainerRow>
        <Icon color={getMimeTypeColor(props.mime)}>
          {getMimeTypeIcon(props.mime)}
        </Icon>

        <Content>
          <Name>{props.name}</Name>
          {props.size && <Size>{bytesToSize(props.size)}</Size>}
          <Info>
            <Extension>
              {getMimeTypeDescription(props.mime)}
            </Extension>

            <Link onClick={() => window.open(props.uri)}>
              Download
            </Link>

            {(props.onPreviewClick && props.preview) &&
              <Link onClick={props.onPreviewClick}>
                Preview
              </Link>
            }
          </Info>
        </Content>
      </ContainerRow>
    </Container>
  );
};

export const Attachment: any = React.memo((props: IAttachmentProps) => <AttachmentComponent {...props} />);
