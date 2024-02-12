# -*- coding: utf-8 -*-
# Copyright 2023 Google LLC
#
# Licensed under the Apache License, Version 2.0 (the "License");
# you may not use this file except in compliance with the License.
# You may obtain a copy of the License at
#
#     http://www.apache.org/licenses/LICENSE-2.0
#
# Unless required by applicable law or agreed to in writing, software
# distributed under the License is distributed on an "AS IS" BASIS,
# WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
# See the License for the specific language governing permissions and
# limitations under the License.
#
from __future__ import annotations

from typing import MutableMapping, MutableSequence

import proto  # type: ignore

from google.protobuf import timestamp_pb2  # type: ignore


__protobuf__ = proto.module(
    package='google.events.cloud.storage.v1',
    manifest={
        'StorageObjectData',
    },
)


class StorageObjectData(proto.Message):
    r"""An object within Google Cloud Storage.

    Attributes:
        content_encoding (str):
            Content-Encoding of the object data, matching
            [https://tools.ietf.org/html/rfc7231#section-3.1.2.2][RFC
            7231 §3.1.2.2]
        content_disposition (str):
            Content-Disposition of the object data, matching
            [https://tools.ietf.org/html/rfc6266][RFC 6266].
        cache_control (str):
            Cache-Control directive for the object data, matching
            [https://tools.ietf.org/html/rfc7234#section-5.2"][RFC 7234
            §5.2].
        content_language (str):
            Content-Language of the object data, matching
            [https://tools.ietf.org/html/rfc7231#section-3.1.3.2][RFC
            7231 §3.1.3.2].
        metageneration (int):
            The version of the metadata for this object
            at this generation. Used for preconditions and
            for detecting changes in metadata. A
            metageneration number is only meaningful in the
            context of a particular generation of a
            particular object.
        time_deleted (google.protobuf.timestamp_pb2.Timestamp):
            The deletion time of the object. Will be
            returned if and only if this version of the
            object has been deleted.
        content_type (str):
            Content-Type of the object data, matching
            [https://tools.ietf.org/html/rfc7231#section-3.1.1.5][RFC
            7231 §3.1.1.5]. If an object is stored without a
            Content-Type, it is served as ``application/octet-stream``.
        size (int):
            Content-Length of the object data in bytes, matching
            [https://tools.ietf.org/html/rfc7230#section-3.3.2][RFC 7230
            §3.3.2].
        time_created (google.protobuf.timestamp_pb2.Timestamp):
            The creation time of the object.
            Attempting to set this field will result in an
            error.
        crc32c (str):
            CRC32c checksum. For more information about using the CRC32c
            checksum, see
            [https://cloud.google.com/storage/docs/hashes-etags#_JSONAPI][Hashes
            and ETags: Best Practices].
        component_count (int):
            Number of underlying components that make up
            this object. Components are accumulated by
            compose operations. Attempting to set this field
            will result in an error.
        md5_hash (str):
            MD5 hash of the data; encoded using base64 as per
            [https://tools.ietf.org/html/rfc4648#section-4][RFC 4648
            §4]. For more information about using the MD5 hash, see
            [https://cloud.google.com/storage/docs/hashes-etags#_JSONAPI][Hashes
            and ETags: Best Practices].
        etag (str):
            HTTP 1.1 Entity tag for the object. See
            [https://tools.ietf.org/html/rfc7232#section-2.3][RFC 7232
            §2.3].
        updated (google.protobuf.timestamp_pb2.Timestamp):
            The modification time of the object metadata.
        storage_class (str):
            Storage class of the object.
        kms_key_name (str):
            Cloud KMS Key used to encrypt this object, if
            the object is encrypted by such a key.
        time_storage_class_updated (google.protobuf.timestamp_pb2.Timestamp):
            The time at which the object's storage class
            was last changed.
        temporary_hold (bool):
            Whether an object is under temporary hold.
        retention_expiration_time (google.protobuf.timestamp_pb2.Timestamp):
            A server-determined value that specifies the
            earliest time that the object's retention period
            expires.
        metadata (MutableMapping[str, str]):
            User-provided metadata, in key/value pairs.
        event_based_hold (bool):
            Whether an object is under event-based hold.
        name (str):
            The name of the object.
        id (str):
            The ID of the object, including the bucket
            name, object name, and generation number.
        bucket (str):
            The name of the bucket containing this
            object.
        generation (int):
            The content generation of this object. Used
            for object versioning. Attempting to set this
            field will result in an error.
        customer_encryption (google.events.cloud.storage_v1.types.StorageObjectData.CustomerEncryption):
            Metadata of customer-supplied encryption key,
            if the object is encrypted by such a key.
        media_link (str):
            Media download link.
        self_link (str):
            The link to this object.
        kind (str):
            The kind of item this is. For objects, this
            is always "storage#object".
    """

    class CustomerEncryption(proto.Message):
        r"""Describes the customer-specified mechanism used to store the
        data at rest.

        Attributes:
            encryption_algorithm (str):
                The encryption algorithm.
            key_sha256 (str):
                SHA256 hash value of the encryption key.
        """

        encryption_algorithm: str = proto.Field(
            proto.STRING,
            number=1,
        )
        key_sha256: str = proto.Field(
            proto.STRING,
            number=2,
        )

    content_encoding: str = proto.Field(
        proto.STRING,
        number=1,
    )
    content_disposition: str = proto.Field(
        proto.STRING,
        number=2,
    )
    cache_control: str = proto.Field(
        proto.STRING,
        number=3,
    )
    content_language: str = proto.Field(
        proto.STRING,
        number=5,
    )
    metageneration: int = proto.Field(
        proto.INT64,
        number=6,
    )
    time_deleted: timestamp_pb2.Timestamp = proto.Field(
        proto.MESSAGE,
        number=7,
        message=timestamp_pb2.Timestamp,
    )
    content_type: str = proto.Field(
        proto.STRING,
        number=8,
    )
    size: int = proto.Field(
        proto.INT64,
        number=9,
    )
    time_created: timestamp_pb2.Timestamp = proto.Field(
        proto.MESSAGE,
        number=10,
        message=timestamp_pb2.Timestamp,
    )
    crc32c: str = proto.Field(
        proto.STRING,
        number=11,
    )
    component_count: int = proto.Field(
        proto.INT32,
        number=12,
    )
    md5_hash: str = proto.Field(
        proto.STRING,
        number=13,
    )
    etag: str = proto.Field(
        proto.STRING,
        number=14,
    )
    updated: timestamp_pb2.Timestamp = proto.Field(
        proto.MESSAGE,
        number=15,
        message=timestamp_pb2.Timestamp,
    )
    storage_class: str = proto.Field(
        proto.STRING,
        number=16,
    )
    kms_key_name: str = proto.Field(
        proto.STRING,
        number=17,
    )
    time_storage_class_updated: timestamp_pb2.Timestamp = proto.Field(
        proto.MESSAGE,
        number=18,
        message=timestamp_pb2.Timestamp,
    )
    temporary_hold: bool = proto.Field(
        proto.BOOL,
        number=19,
    )
    retention_expiration_time: timestamp_pb2.Timestamp = proto.Field(
        proto.MESSAGE,
        number=20,
        message=timestamp_pb2.Timestamp,
    )
    metadata: MutableMapping[str, str] = proto.MapField(
        proto.STRING,
        proto.STRING,
        number=21,
    )
    event_based_hold: bool = proto.Field(
        proto.BOOL,
        number=29,
    )
    name: str = proto.Field(
        proto.STRING,
        number=23,
    )
    id: str = proto.Field(
        proto.STRING,
        number=24,
    )
    bucket: str = proto.Field(
        proto.STRING,
        number=25,
    )
    generation: int = proto.Field(
        proto.INT64,
        number=26,
    )
    customer_encryption: CustomerEncryption = proto.Field(
        proto.MESSAGE,
        number=28,
        message=CustomerEncryption,
    )
    media_link: str = proto.Field(
        proto.STRING,
        number=100,
    )
    self_link: str = proto.Field(
        proto.STRING,
        number=101,
    )
    kind: str = proto.Field(
        proto.STRING,
        number=102,
    )


__all__ = tuple(sorted(__protobuf__.manifest))
