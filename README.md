# GPhotoApp

[![MIT License](http://img.shields.io/badge/license-MIT-blue.svg?style=flat)](LICENSE)

<a name="overview"></a>

# Overview

A Google Apps Script (GAS) library exposing the Google Photos Library API.

Based on https://github.com/tanaikech/GPhotoApp

<a name="description"></a>

## Description

Currently, the Photos Library API is not available under [Advanced Google services](https://developers.google.com/apps-script/guides/services/advanced). This library enables access via the `UrlFetchApp` service.

## Usage

1. Copy + paste the contents of `PhotoApp.js` to a new file in your Apps Script project.
1. Link the Cloud Platform project to your Google Apps Script project: Apps Script Sidebar > Project Settings > Google Cloud Platform (GCP) Project. See also [here](https://gist.github.com/tanaikech/e945c10917fac34a9d5d58cad768832c).
1. [Enable the Photos Library API at the GCP Console](https://console.developers.google.com/apis/library/photoslibrary.googleapis.com)
1. Edit `appsscript.json` in your project to include the scopes required for Google Photos access (see included sample file):

```json
  "oauthScopes": [
    "https://www.googleapis.com/auth/photoslibrary",
    "https://www.googleapis.com/auth/script.external_request"
  ]
```

### Notes

- This library uses modern Javascript. V8 runtime must be [enabled](https://developers.google.com/apps-script/guides/v8-runtime).
- Media items can be created only within the albums created by your app (see [here](https://developers.google.com/photos/library/guides/upload-media#creating-media-item)). Attempting to upload to an album not created by your app will result in the error: `No permission to add media items to this album`.
- Paginated results are returned as iterators. Use [`for...of`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Statements/for...of) to iterate over them. If you need all of them, you can use [`Array.from()`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/from).

# Documentation

| Methods                                                 | Description                 |
| :------------------------------------------------------ | :-------------------------- |
| [createAlbum(object)](#createalbum)                     | Create new album.           |
| [getAlbumList(excludeNonAppCreatedData)](#getalbumList) | Get album list.             |
| [getMediaItemList()](#getmediaitemList)                 | Get media item list.        |
| [getMediaItems(object)](#getmediaitems)                 | Get media items.            |
| [getMediaItem(object)](#getmediaitem)                   | Gets a media item.          |
| [getMediaItemBlob(object)](#getmediaitemblob)           | Gets data for a media item. |
| [uploadMediaItems(object)](#uploadmediaitems)           | Upload images to album.     |

<a name="usage"></a>

## Sample scripts

<a name="createalbum"></a>

### `createAlbum` ([albums.create](https://developers.google.com/photos/library/reference/rest/v1/albums/create))

```javascript
function createAlbum() {
  const resource = { album: { title: "sample title" } };
  const res = PhotoApp.createAlbum(resource);
  console.log(res);
}
```

<a name="getalbumList"></a>

### `getAlbumList` ([albums.list](https://developers.google.com/photos/library/reference/rest/v1/albums/list))

```javascript
function getAlbumList() {
  const res = Array.from(
    PhotoApp.getAlbumList({ excludeNonAppCreatedData: true })
  );
  console.log(res);
}
```

<a name="getmediaitemList"></a>

### `getMediaItemList` ([mediaItems.list](https://developers.google.com/photos/library/reference/rest/v1/mediaItems/list))

```javascript
function getMediaItemList() {
  const res = Array.from(PhotoApp.getMediaItemList());
  console.log(res);
}
```

<a name="getmediaitemList"></a>

### `searchMediaItems` ([mediaItems.search](https://developers.google.com/photos/library/reference/rest/v1/mediaItems/search))

```javascript
function searchMediaItems() {
  const albumId = "###"; // Album ID
  const res = Array.from(PhotoApp.searchMediaItems({ albumId }));
  console.log(res);
}
```

<a name="getmediaitems"></a>

### `getMediaItems` ([mediaItems.batchGet](https://developers.google.com/photos/library/reference/rest/v1/mediaItems/batchGet))

```javascript
function getMediaItems() {
  const resource = { mediaItemIds: ["###", "###"] };
  // Note that since the list is limited to requested items, this does not return an iterator.
  const res = PhotoApp.getMediaItems(resource);
  console.log(res);
}
```

<a name="getmediaitem"></a>

### `getMediaItem` ([mediaItems.get](https://developers.google.com/photos/library/reference/rest/v1/mediaItems/get))

```javascript
function getMediaItem() {
  const id = "###";
  const res = PhotoApp.getMediaItem({ mediaItemId: id });
  console.log(res);
}
```

<a name="getmediaitemblob"></a>

### `getMediaItemBlob`

```javascript
function getMediaItems() {
  const id = "###";
  const mediaItem = PhotoApp.getMediaItem({ mediaItemId: id });
  const blob = PhotoApp.getMediaItemBlob(mediaItem);
  blob.setName(mediaItem.filename);
  DriveApp.createFile(blob);
  console.log(res);
}
```

<a name="uploadmediaitems"></a>

### `uploadMediaItems` ([mediaItems.batchCreate](https://developers.google.com/photos/library/reference/rest/v1/mediaItems/batchCreate))

```javascript
function uploadMediaItems() {
  const albumId = "###"; // Album ID
  const fileId = "###"; // File ID
  const url = "###"; // URL of image file
  const resource = {
    albumId: albumId,
    items: [
      {
        blob: DriveApp.getFileById(fileId).getBlob(),
        description: "description1",
        filename: "filename1",
      },
      {
        blob: UrlFetchApp.fetch(url).getBlob(),
        description: "description2",
        filename: "filename2",
      },
    ],
  };
  const res = PhotoApp.uploadMediaItems(resource);
  console.log(JSON.stringify(res));
}
```

<a name="license"></a>

# License

[MIT](LICENSE)

<a name="author"></a>

# Authors

[Tanaike](https://tanaikech.github.io/about/), [kwikwag](https://github.com/kwikwag/GPhotoApp)

<a name="updatehistory"></a>

# Update History

- v1.0.0 (February 26, 2020) (tanaikech)

  1. Initial release.

- v1.1.0 (January 20, 2022) (kwikwag)

  1. Added some methods
  2. Refactored code
  3. Fixed broken pagination API
  4. Minor breaking interface changes
