# GPhotoApp

<a name="top"></a>
[![MIT License](http://img.shields.io/badge/license-MIT-blue.svg?style=flat)](LICENCE)

<a name="overview"></a>

# Overview

**This is a GAS library for retrieving and creating the albums and media items using Google Photo API using Google Apps Script (GAS).**

<a name="description"></a>

## Description

In the current stage, Google Photo API is not included in Advanced Google services. But in order to use Google Photo API with Google Apps Script, I created this as a GAS library. So in the current stage, in order to use this library, the following flow is required.

1. Link Cloud Platform Project to Google Apps Script Project.
2. Enable Google Photo API at API console
3. Set the scopes to the manifest file of the Google Apps Script.

When above flow is done, the following functions can be used with this library.

1. Create new album.
2. Get album list.
3. Get media item list.
4. Get media items.
5. Upload images to album.

# Library's project key

```
1lGrUiaweQjQwVV_QwWuJDJVbCuY2T0BfVphw6VmT85s9LJFntav1wzs9
```

# Methods

In the current stage, I prepared 5 methods that I required.

| Methods                                                 | Description             |
| :------------------------------------------------------ | :---------------------- |
| [createAlbum(object)](#createalbum)                     | Create new album.       |
| [getAlbumList(excludeNonAppCreatedData)](#getalbumList) | Get album list.         |
| [getMediaItemList()](#getmediaitemList)                 | Get media item list.    |
| [getMediaItems(object)](#getmediaitems)                 | Get media items.        |
| [uploadMediaItems(object)](#uploadmediaitems)           | Upload images to album. |

<a name="usage"></a>

# Usage:

## 1. Linking Cloud Platform Project to Google Apps Script Project:

About this, you can see the detail flow at [here](https://gist.github.com/tanaikech/e945c10917fac34a9d5d58cad768832c).

## 2. Install library

In order to use this library, please install this library as follows.

1. Create a GAS project.

   - You can use this library for the GAS project of both the standalone type and the container-bound script type.

1. [Install DateFinder library](https://developers.google.com/apps-script/guides/libraries).

   - Library's project key is **`1lGrUiaweQjQwVV_QwWuJDJVbCuY2T0BfVphw6VmT85s9LJFntav1wzs9`**.

### IMPORTANT

**This library uses V8 runtime. So please enable V8 at the script editor.**

### About scopes

This library use the following 2 scopes.

- `https://www.googleapis.com/auth/photoslibrary`
- `https://www.googleapis.com/auth/script.external_request`

In this case, when the library is installed, these scopes are also installed.

## Methods

<a name="createalbum"></a>

### `createAlbum`

#### Sample script

```javascript
function createAlbum() {
  var resource = { album: { title: "sample title" } };
  const res = GPhotoApp.createAlbum(resource);
  console.log(res);
}
```

- [Method: albums.create](https://developers.google.com/photos/library/reference/rest/v1/albums/create)

<a name="getalbumList"></a>

### `getAlbumList`

#### Sample script

```javascript
function getAlbumList() {
  const excludeNonAppCreatedData = true;
  const res = GPhotoApp.getAlbumList(excludeNonAppCreatedData);
  console.log(res);
}
```

- [Method: albums.list](https://developers.google.com/photos/library/reference/rest/v1/albums/list)

<a name="getmediaitemList"></a>

### `getMediaItemList`

#### Sample script

```javascript
function getMediaItemList() {
  const res = GPhotoApp.getMediaItemList();
  console.log(res);
}
```

- [Method: mediaItems.list](https://developers.google.com/photos/library/reference/rest/v1/mediaItems/list)

<a name="getmediaitems"></a>

### `getMediaItems`

#### Sample script

```javascript
function getMediaItems() {
  var resource = { mediaItemIds: ["###", "###", , ,] };
  const res = GPhotoApp.getMediaItems(resource);
  console.log(res);
}
```

- [Method: mediaItems.batchGet](https://developers.google.com/photos/library/reference/rest/v1/mediaItems/batchGet)

<a name="uploadmediaitems"></a>

### `uploadMediaItems`

#### Sample script

```javascript
function uploadMediaItems() {
  const albumId = "###"; // Album ID
  const id = "###"; // file ID
  const url = "###"; // URL of image file
  const resource = {
    albumId: albumId,
    items: [
      {
        blob: DriveApp.getFileById(id).getBlob(),
        description: "description1",
        filename: "filename1"
      },
      {
        blob: UrlFetchApp.fetch(url).getBlob(),
        description: "description2",
        filename: "filename2"
      }
    ]
  };
  const res = GPhotoApp.uploadMediaItems(resource);
  console.log(JSON.stringify(res));
}
```

- [Method: mediaItems.batchCreate](https://developers.google.com/photos/library/reference/rest/v1/mediaItems/batchCreate)

> IMPORTANT
> If the error of `No permission to add media items to this album.` occurs, please create the album by the script. [The official document](https://developers.google.com/photos/library/guides/upload-media#creating-media-item) says as follows.
>
> ```
> Media items can be created only within the albums created by your app.
> ```
>
> In this case, please create new album by the following script, and please retrieve the album ID.
>
> ```javascript
> function createNewAlbum() {
>   var options = {
>     headers: { Authorization: "Bearer " + ScriptApp.getOAuthToken() },
>     payload: JSON.stringify({ album: { title: "sample title" } }),
>     contentType: "application/json",
>     method: "post"
>   };
>   var res = UrlFetchApp.fetch(
>     "https://photoslibrary.googleapis.com/v1/albums",
>     options
>   );
>   Logger.log(res);
> }
> ```
>
> Also about this, when the property of `isWriteable` in the album list is `true`, the image file can be added to the album. [Ref](https://developers.google.com/photos/library/reference/rest/v1/albums)

<a name="licence"></a>

# Licence

[MIT](LICENCE)

<a name="author"></a>

# Author

[Tanaike](https://tanaikech.github.io/about/)

If you have any questions and commissions for me, feel free to tell me.

<a name="updatehistory"></a>

# Update History

- v1.0.0 (February 26, 2020)

  1. Initial release.

[TOP](#top)
