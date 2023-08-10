const { consoleTestResultHandler } = require("tslint/lib/test");
const { 
  initDevKit,
  getUserId,
  getToken,
  postAppMessage,
  closeAppModal,
  closeAppPanel,
  openAppPanel,
  openAppModal,
  syncMessageHeight,
  createChannelMessage,
  deleteChannelMessagesWithResourceId,
  updateChannelMessagesWithResourceId,
} = require("../lib/index");

const API_PRODUCTION = "https://api.weekday.work/v1";
const API_DEVELOPMENT = "http://localhost:8181/v1";

const DISPATCH_APP_ACTION = "DISPATCH_APP_ACTION";
const SYNC_MESSAGE_HEIGHT = "SYNC_MESSAGE_HEIGHT";
const MODAL_CLOSE = "modal-close";
const PANEL_CLOSE = "panel-close";
const MODAL_OPEN = "modal";
const PANEL_OPEN = "panel";

const WIDTH = "100%";
const HEIGHT = "100%";
const APP_TOKEN = "APP_TOKEN";
const CHANNEL_TOKEN = "CHANNEL_TOKEN";
const NAME = "NAME";
const USER_ID = "JEST";
const CHANNEL_ID = "CHANNEL";
const RESIZE_ID = "RESIZE";
const TEAM_ID = "TEAM";
const INVALID_URL = "https://app.weekday.work/invalid";
const URL = "https://app.weekday.work/testing?userId=" + USER_ID + "&teamId=" + TEAM_ID + "&channelId=" + CHANNEL_ID;

test('initializes dev kit with an app token', () => {
  Object.defineProperty(window, 'location', {
    value: {
      href: URL
    }
  });

  expect(initDevKit(APP_TOKEN)).toBe(true);
  expect(getToken()).toBe(APP_TOKEN);
  expect(getUserId()).toBe(USER_ID);   
  expect(
    window.API_URL === API_PRODUCTION || 
    window.API_URL === API_DEVELOPMENT
  ).toBe(true);
});

test('initializes dev kit with an app token, but invalid URL', () => {
  window.location.href = INVALID_URL;

  expect(initDevKit(APP_TOKEN)).toBe(true);
  expect(getToken()).toBe(APP_TOKEN);
  expect(() => {
    getUserId();
  }).toThrow();
  expect(
    window.API_URL === API_PRODUCTION || 
    window.API_URL === API_DEVELOPMENT
  ).toBe(true);
});

test('the window is receiving events', () => {
  window.top.postMessage = jest.fn((event, cb) => {
    expect(event).toBe(true);
  });

  postAppMessage(true);
});

test('the window is receiving modal closing events', () => {
  window.top.postMessage = jest.fn((event, cb) => {
    expect(event.type).toBe(DISPATCH_APP_ACTION);
    expect(event.content.action.type).toBe(MODAL_CLOSE);
  });

  closeAppModal();
});

test('the window is receiving panel closing events', () => {
  window.top.postMessage = jest.fn((event, cb) => {
    expect(event.type).toBe(DISPATCH_APP_ACTION);
    expect(event.content.action.type).toBe(PANEL_CLOSE);
  });

  closeAppPanel();
});

test('the window is receiving modal opening events', () => {
  window.top.postMessage = jest.fn((event, cb) => {
    expect(event.type).toBe(DISPATCH_APP_ACTION);
    expect(event.content.action.type).toBe(MODAL_OPEN);
  });

  openAppModal(NAME, URL, WIDTH, HEIGHT, CHANNEL_TOKEN);
});

test('the window is receiving panel opening events', () => {
  window.top.postMessage = jest.fn((event, cb) => {
    expect(event.type).toBe(DISPATCH_APP_ACTION);
    expect(event.content.action.type).toBe(PANEL_OPEN);
  });

  openAppPanel(NAME, URL, CHANNEL_TOKEN);
});

test('the window is receiving message iframe resizing events', () => {
  jest.useFakeTimers();

  // Mock the document element
  Object.defineProperty(document, 'documentElement', {
    configurable: true,
    get () {
      return document.createElement('document');
    },
  });

  window.top.postMessage = jest.fn((event, cb) => {
    expect(event.type).toBe(SYNC_MESSAGE_HEIGHT);
    expect(event.content.resizeId).toBe(RESIZE_ID);
  });

  syncMessageHeight(RESIZE_ID);  

  // Advance timers
  jest.advanceTimersByTime(500);  
});

test('API calls are returning Promises & getting fired correctly', () => {
  // ⚠️ TODO: These need mock API routes on the sevrer
  // createChannelMessage
  // deleteChannelMessagesWithResourceId
  // updateChannelMessagesWithResourceId
});
