import React from 'react'
import styled from 'styled-components'
import PropTypes from 'prop-types'
import { Markdown } from '../icons/Markdown'
import {
  BiCog,
  BiPlusCircle,
  BiCalendar,
  BiCheck,
  BiCheckDouble,
  BiVideo,
  BiVideoOff,
  BiColumns,
  BiPaperclip,
  BiUserCircle,
  BiGroup,
  BiLogOutCircle,
  BiStar,
  BiAt,
  BiSend,
  BiSmile,
  BiBuoy,
  BiDockLeft,
  BiDockRight,
  BiRectangle,
  BiCube,
  BiFlag,
  BiSearch,
  BiLike,
  BiTrash,
  BiPencil,
  BiBell,
  BiBellOff,
  BiChevronRight,
  BiChevronUp,
  BiChevronDown,
  BiChevronLeft,
  BiHash,
  BiX,
  BiLockAlt,
  BiLockOpenAlt,
  BiBroadcast,
  BiAlignLeft,
  BiFileBlank,
  BiFile,
  BiShareAlt,
  BiShare,
  BiMicrophone,
  BiMicrophoneOff,
  BiDotsHorizontalRounded,
  BiDotsVerticalRounded,
  BiMessageSquareDetail,
  BiUserMinus,
  BiHide,
  BiShow,
  BiPlus,
  BiMobileAlt,
  BiDesktop,
  BiMenu,
  BiSubdirectoryRight,
  BiRefresh,
  BiQuestionMark,
  BiShield,
  BiBox,
  BiCompass,
  BiBold,
  BiItalic,
  BiUnderline,
  BiCode,
  BiListUl,
  BiLink,
  BiListOl,
} from 'react-icons/bi'
import {
  AiOutlineSetting,
  AiOutlineNotification,
  AiOutlineQuestionCircle,
  AiOutlineFlag,
  AiOutlineCheckCircle,
  AiOutlineCalendar,
  AiOutlineProject,
  AiOutlineMessage,
  AiOutlineMinusCircle,
  AiOutlineStar,
  AiFillStar,
  AiOutlineSmile,
  AiOutlineUnlock,
  AiOutlineLock,
  AiOutlineNumber,
  AiOutlineAppstore,
  AiOutlinePaperClip,
  AiOutlinePushpin,
} from 'react-icons/ai'
import { CgQuote } from 'react-icons/cg'

export function IconComponent({ size, color, icon, className, onClick, style }) {
  const getIcon = () => {
    switch (icon) {
      case 'pin':
        return <AiOutlinePushpin size={size} width={size} height={size} color={color} />
      case 'link':
        return <BiLink size={size} width={size} height={size} color={color} />
      case 'bold':
        return <BiBold size={size} width={size} height={size} color={color} />
      case 'italic':
        return <BiItalic size={size} width={size} height={size} color={color} />
      case 'underline':
        return <BiUnderline size={size} width={size} height={size} color={color} />
      case 'code':
        return <BiCode size={size} width={size} height={size} color={color} />
      case 'blockquote':
        return <CgQuote size={size} width={size} height={size} color={color} />
      case 'list-numbered':
        return <BiListOl size={size} width={size} height={size} color={color} />
      case 'list-bulleted':
        return <BiListUl size={size} width={size} height={size} color={color} />
      case 'channels-help':
        return <AiOutlineQuestionCircle size={size} width={size} height={size} color={color} />
      case 'channels-notifications':
        return <AiOutlineFlag size={size} width={size} height={size} color={color} />
      case 'calendar-empty':
        return <AiOutlineCalendar size={size} width={size} height={size} color={color} />
      case 'check-circle':
        return <AiOutlineCheckCircle size={size} width={size} height={size} color={color} />
      case 'channels-settings':
        return <AiOutlineSetting size={size} width={size} height={size} color={color} />
      case 'boards':
        return <AiOutlineProject size={size} width={size} height={size} color={color} />
      case 'corner-down-right':
        return <BiSubdirectoryRight size={size} width={size} height={size} color={color} />
      case 'align-left':
        return <BiAlignLeft size={size} width={size} height={size} color={color} />
      case 'life-buoy':
        return <BiBuoy size={size} width={size} height={size} color={color} />
      case 'calendar':
        return <BiCalendar size={size} width={size} height={size} color={color} />
      case 'file':
        return <BiFileBlank size={size} width={size} height={size} color={color} />
      case 'file-text':
        return <BiFile size={size} width={size} height={size} color={color} />
      case 'menu':
        return <BiMenu size={size} width={size} height={size} color={color} />
      case 'square':
        return <BiRectangle size={size} width={size} height={size} color={color} />
      case 'sidebar-left':
        return <BiDockLeft size={size} width={size} height={size} color={color} />
      case 'sidebar-right':
        return <BiDockRight size={size} width={size} height={size} color={color} />
      case 'video-off':
        return <BiVideoOff size={size} width={size} height={size} color={color} />
      case 'video':
        return <BiVideo size={size} width={size} height={size} color={color} />
      case 'mic-off':
        return <BiMicrophoneOff size={size} width={size} height={size} color={color} />
      case 'mic':
        return <BiMicrophone size={size} width={size} height={size} color={color} />
      case 'monitor':
        return <BiDesktop size={size} width={size} height={size} color={color} />
      case 'smartphone':
        return <BiMobileAlt size={size} width={size} height={size} color={color} />
      case 'hash':
        return <AiOutlineNumber size={size} width={size} height={size} color={color} />
      case 'compass':
        return <BiCompass size={size} width={size} height={size} color={color} />
      case 'flag':
        return <BiFlag size={size} width={size} height={size} color={color} />
      case 'package':
        return <AiOutlineAppstore size={size} width={size} height={size} color={color} />
      case 'box':
        return <BiBox size={size} width={size} height={size} color={color} />
      case 'radio':
        return <BiBroadcast size={size} width={size} height={size} color={color} />
      case 'share1':
        return <BiShareAlt size={size} width={size} height={size} color={color} />
      case 'share':
        return <BiShareAlt size={size} width={size} height={size} color={color} />
      case 'lock':
        return <AiOutlineLock size={size} width={size} height={size} color={color} />
      case 'unlock':
        return <AiOutlineUnlock size={size} width={size} height={size} color={color} />
      case 'shield':
        return <BiShield size={size} width={size} height={size} color={color} />
      case 'user-minus':
        return <BiUserMinus size={size} width={size} height={size} color={color} />
      case 'message-minus':
        return <AiOutlineMinusCircle size={size} width={size} height={size} color={color} />
      case 'message-circle':
        return <AiOutlineMessage size={size} width={size} height={size} color={color} />
      case 'eye':
        return <BiShow size={size} width={size} height={size} color={color} />
      case 'eye-off':
        return <BiHide size={size} width={size} height={size} color={color} />
      case 'users':
        return <BiGroup size={size} width={size} height={size} color={color} />
      case 'delete':
        return <BiTrash size={size} width={size} height={size} color={color} />
      case 'smile':
        return <AiOutlineSmile size={size} width={size} height={size} color={color} />
      case 'attachment':
        return <AiOutlinePaperClip size={size} width={size} height={size} color={color} />
      case 'send':
        return <BiSend size={size} width={size} height={size} color={color} />
      case 'at':
        return <BiAt size={size} width={size} height={size} color={color} />
      case 'plus-circle':
        return <BiPlusCircle size={size} width={size} height={size} color={color} />
      case 'plus':
        return <BiPlus size={size} width={size} height={size} color={color} />
      case 'double-check':
        return <BiCheckDouble size={size} width={size} height={size} color={color} />
      case 'check':
        return <BiCheck size={size} width={size} height={size} color={color} />
      case 'x':
        return <BiX size={size} width={size} height={size} color={color} />
      case 'bell':
        return <BiBell size={size} width={size} height={size} color={color} />
      case 'bell-off':
        return <BiBellOff size={size} width={size} height={size} color={color} />
      case 'pen':
        return <BiPencil size={size} width={size} height={size} color={color} />
      case 'reply':
        return <BiShare size={size} width={size} height={size} color={color} />
      case 'chevron-down':
        return <BiChevronDown size={size} width={size} height={size} color={color} />
      case 'chevron-up':
        return <BiChevronUp size={size} width={size} height={size} color={color} />
      case 'chevron-right':
        return <BiChevronRight size={size} width={size} height={size} color={color} />
      case 'chevron-left':
        return <BiChevronLeft size={size} width={size} height={size} color={color} />
      case 'profile':
        return <BiUserCircle size={size} width={size} height={size} color={color} />
      case 'settings':
        return <BiCog size={size} width={size} height={size} color={color} />
      case 'question':
        return <BiQuestionMark size={size} width={size} height={size} color={color} />
      case 'logout':
        return <BiLogOutCircle size={size} width={size} height={size} color={color} />
      case 'refresh':
        return <BiRefresh size={size} width={size} height={size} color={color} />
      case 'more-h':
        return <BiDotsHorizontalRounded size={size} width={size} height={size} color={color} />
      case 'more-v':
        return <BiDotsVerticalRounded size={size} width={size} height={size} color={color} />
      case 'star':
        return <AiOutlineStar size={size} width={size} height={size} color={color} />
      case 'star-fill':
        return <AiFillStar size={size} width={size} height={size} color={color} />
      case 'search':
        return <BiSearch size={size} width={size} height={size} color={color} />
      case 'markdown':
        return <Markdown width={size} height={size} color={color} />
      case 'thumbs-up':
        return <BiLike size={size} width={size} height={size} color={color} />
      case 'flag':
        return <BiFlag size={size} width={size} height={size} color={color} />
    }
  }

  return (
    <span
      style={{
        ...style,
        position: 'relative',
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'row',
        alignContent: 'center',
        alignItems: 'center',
        justifyContent: 'center',
        display: 'inline-block',
        width: size + 'px',
        height: size + 'px',
      }}
      className={className}
      onClick={onClick}
    >
      {getIcon()}
    </span>
  )
}

IconComponent.propTypes = {}
