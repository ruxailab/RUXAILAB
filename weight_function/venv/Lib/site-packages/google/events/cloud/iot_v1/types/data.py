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
from google.rpc import status_pb2  # type: ignore


__protobuf__ = proto.module(
    package='google.events.cloud.iot.v1',
    manifest={
        'MqttState',
        'HttpState',
        'LogLevel',
        'GatewayType',
        'GatewayAuthMethod',
        'PublicKeyCertificateFormat',
        'PublicKeyFormat',
        'Device',
        'GatewayConfig',
        'DeviceRegistry',
        'MqttConfig',
        'HttpConfig',
        'EventNotificationConfig',
        'StateNotificationConfig',
        'RegistryCredential',
        'X509CertificateDetails',
        'PublicKeyCertificate',
        'DeviceCredential',
        'PublicKeyCredential',
        'DeviceConfig',
        'DeviceState',
        'DeviceEventData',
        'RegistryEventData',
    },
)


class MqttState(proto.Enum):
    r"""Indicates whether an MQTT connection is enabled or disabled.
    See the field description for details.

    Values:
        MQTT_STATE_UNSPECIFIED (0):
            No MQTT state specified. If not specified,
            MQTT will be enabled by default.
        MQTT_ENABLED (1):
            Enables a MQTT connection.
        MQTT_DISABLED (2):
            Disables a MQTT connection.
    """
    MQTT_STATE_UNSPECIFIED = 0
    MQTT_ENABLED = 1
    MQTT_DISABLED = 2


class HttpState(proto.Enum):
    r"""Indicates whether DeviceService (HTTP) is enabled or disabled
    for the registry. See the field description for details.

    Values:
        HTTP_STATE_UNSPECIFIED (0):
            No HTTP state specified. If not specified,
            DeviceService will be enabled by default.
        HTTP_ENABLED (1):
            Enables DeviceService (HTTP) service for the
            registry.
        HTTP_DISABLED (2):
            Disables DeviceService (HTTP) service for the
            registry.
    """
    HTTP_STATE_UNSPECIFIED = 0
    HTTP_ENABLED = 1
    HTTP_DISABLED = 2


class LogLevel(proto.Enum):
    r"""**Beta Feature**

    The logging verbosity for device activity. Specifies which events
    should be written to logs. For example, if the LogLevel is ERROR,
    only events that terminate in errors will be logged. LogLevel is
    inclusive; enabling INFO logging will also enable ERROR logging.

    Values:
        LOG_LEVEL_UNSPECIFIED (0):
            No logging specified. If not specified,
            logging will be disabled.
        NONE (10):
            Disables logging.
        ERROR (20):
            Error events will be logged.
        INFO (30):
            Informational events will be logged, such as
            connections and disconnections.
        DEBUG (40):
            All events will be logged.
    """
    LOG_LEVEL_UNSPECIFIED = 0
    NONE = 10
    ERROR = 20
    INFO = 30
    DEBUG = 40


class GatewayType(proto.Enum):
    r"""Gateway type.

    Values:
        GATEWAY_TYPE_UNSPECIFIED (0):
            If unspecified, the device is considered a
            non-gateway device.
        GATEWAY (1):
            The device is a gateway.
        NON_GATEWAY (2):
            The device is not a gateway.
    """
    GATEWAY_TYPE_UNSPECIFIED = 0
    GATEWAY = 1
    NON_GATEWAY = 2


class GatewayAuthMethod(proto.Enum):
    r"""The gateway authorization/authentication method. This setting
    determines how Cloud IoT Core authorizes/authenticate devices to
    access the gateway.

    Values:
        GATEWAY_AUTH_METHOD_UNSPECIFIED (0):
            No authentication/authorization method
            specified. No devices are allowed to access the
            gateway.
        ASSOCIATION_ONLY (1):
            The device is authenticated through the
            gateway association only. Device credentials are
            ignored even if provided.
        DEVICE_AUTH_TOKEN_ONLY (2):
            The device is authenticated through its own
            credentials. Gateway association is not checked.
        ASSOCIATION_AND_DEVICE_AUTH_TOKEN (3):
            The device is authenticated through both
            device credentials and gateway association. The
            device must be bound to the gateway and must
            provide its own credentials.
    """
    GATEWAY_AUTH_METHOD_UNSPECIFIED = 0
    ASSOCIATION_ONLY = 1
    DEVICE_AUTH_TOKEN_ONLY = 2
    ASSOCIATION_AND_DEVICE_AUTH_TOKEN = 3


class PublicKeyCertificateFormat(proto.Enum):
    r"""The supported formats for the public key.

    Values:
        UNSPECIFIED_PUBLIC_KEY_CERTIFICATE_FORMAT (0):
            The format has not been specified. This is an
            invalid default value and must not be used.
        X509_CERTIFICATE_PEM (1):
            An X.509v3 certificate
            (`RFC5280 <https://www.ietf.org/rfc/rfc5280.txt>`__),
            encoded in base64, and wrapped by
            ``-----BEGIN CERTIFICATE-----`` and
            ``-----END CERTIFICATE-----``.
    """
    UNSPECIFIED_PUBLIC_KEY_CERTIFICATE_FORMAT = 0
    X509_CERTIFICATE_PEM = 1


class PublicKeyFormat(proto.Enum):
    r"""The supported formats for the public key.

    Values:
        UNSPECIFIED_PUBLIC_KEY_FORMAT (0):
            The format has not been specified. This is an
            invalid default value and must not be used.
        RSA_PEM (3):
            An RSA public key encoded in base64, and wrapped by
            ``-----BEGIN PUBLIC KEY-----`` and
            ``-----END PUBLIC KEY-----``. This can be used to verify
            ``RS256`` signatures in JWT tokens
            (`RFC7518 <https://www.ietf.org/rfc/rfc7518.txt>`__).
        RSA_X509_PEM (1):
            As RSA_PEM, but wrapped in an X.509v3 certificate
            (`RFC5280 <https://www.ietf.org/rfc/rfc5280.txt>`__),
            encoded in base64, and wrapped by
            ``-----BEGIN CERTIFICATE-----`` and
            ``-----END CERTIFICATE-----``.
        ES256_PEM (2):
            Public key for the ECDSA algorithm using P-256 and SHA-256,
            encoded in base64, and wrapped by
            ``-----BEGIN PUBLIC KEY-----`` and
            ``-----END PUBLIC KEY-----``. This can be used to verify JWT
            tokens with the ``ES256`` algorithm
            (`RFC7518 <https://www.ietf.org/rfc/rfc7518.txt>`__). This
            curve is defined in `OpenSSL <https://www.openssl.org/>`__
            as the ``prime256v1`` curve.
        ES256_X509_PEM (4):
            As ES256_PEM, but wrapped in an X.509v3 certificate
            (`RFC5280 <https://www.ietf.org/rfc/rfc5280.txt>`__),
            encoded in base64, and wrapped by
            ``-----BEGIN CERTIFICATE-----`` and
            ``-----END CERTIFICATE-----``.
    """
    UNSPECIFIED_PUBLIC_KEY_FORMAT = 0
    RSA_PEM = 3
    RSA_X509_PEM = 1
    ES256_PEM = 2
    ES256_X509_PEM = 4


class Device(proto.Message):
    r"""The device resource.

    Attributes:
        id (str):
            The user-defined device identifier. The
            device ID must be unique within a device
            registry.
        name (str):
            The resource path name. For example,
            ``projects/p1/locations/us-central1/registries/registry0/devices/dev0``
            or
            ``projects/p1/locations/us-central1/registries/registry0/devices/{num_id}``.
            When ``name`` is populated as a response from the service,
            it always ends in the device numeric ID.
        num_id (int):
            [Output only] A server-defined unique numeric ID for the
            device. This is a more compact way to identify devices, and
            it is globally unique.
        credentials (MutableSequence[google.events.cloud.iot_v1.types.DeviceCredential]):
            The credentials used to authenticate this device. To allow
            credential rotation without interruption, multiple device
            credentials can be bound to this device. No more than 3
            credentials can be bound to a single device at a time. When
            new credentials are added to a device, they are verified
            against the registry credentials. For details, see the
            description of the ``DeviceRegistry.credentials`` field.
        last_heartbeat_time (google.protobuf.timestamp_pb2.Timestamp):
            [Output only] The last time an MQTT ``PINGREQ`` was
            received. This field applies only to devices connecting
            through MQTT. MQTT clients usually only send ``PINGREQ``
            messages if the connection is idle, and no other messages
            have been sent. Timestamps are periodically collected and
            written to storage; they may be stale by a few minutes.
        last_event_time (google.protobuf.timestamp_pb2.Timestamp):
            [Output only] The last time a telemetry event was received.
            Timestamps are periodically collected and written to
            storage; they may be stale by a few minutes.
        last_state_time (google.protobuf.timestamp_pb2.Timestamp):
            [Output only] The last time a state event was received.
            Timestamps are periodically collected and written to
            storage; they may be stale by a few minutes.
        last_config_ack_time (google.protobuf.timestamp_pb2.Timestamp):
            [Output only] The last time a cloud-to-device config version
            acknowledgment was received from the device. This field is
            only for configurations sent through MQTT.
        last_config_send_time (google.protobuf.timestamp_pb2.Timestamp):
            [Output only] The last time a cloud-to-device config version
            was sent to the device.
        blocked (bool):
            If a device is blocked, connections or
            requests from this device will fail. Can be used
            to temporarily prevent the device from
            connecting if, for example, the sensor is
            generating bad data and needs maintenance.
        last_error_time (google.protobuf.timestamp_pb2.Timestamp):
            [Output only] The time the most recent error occurred, such
            as a failure to publish to Cloud Pub/Sub. This field is the
            timestamp of 'last_error_status'.
        last_error_status (google.rpc.status_pb2.Status):
            [Output only] The error message of the most recent error,
            such as a failure to publish to Cloud Pub/Sub.
            'last_error_time' is the timestamp of this field. If no
            errors have occurred, this field has an empty message and
            the status code 0 == OK. Otherwise, this field is expected
            to have a status code other than OK.
        config (google.events.cloud.iot_v1.types.DeviceConfig):
            The most recent device configuration, which is eventually
            sent from Cloud IoT Core to the device. If not present on
            creation, the configuration will be initialized with an
            empty payload and version value of ``1``. To update this
            field after creation, use the
            ``DeviceManager.ModifyCloudToDeviceConfig`` method.
        state (google.events.cloud.iot_v1.types.DeviceState):
            [Output only] The state most recently received from the
            device. If no state has been reported, this field is not
            present.
        log_level (google.events.cloud.iot_v1.types.LogLevel):
            **Beta Feature**

            The logging verbosity for device activity. If unspecified,
            DeviceRegistry.log_level will be used.
        metadata (MutableMapping[str, str]):
            The metadata key-value pairs assigned to the device. This
            metadata is not interpreted or indexed by Cloud IoT Core. It
            can be used to add contextual information for the device.

            Keys must conform to the regular expression
            [a-zA-Z][a-zA-Z0-9-_.+~%]+ and be less than 128 bytes in
            length.

            Values are free-form strings. Each value must be less than
            or equal to 32 KB in size.

            The total size of all keys and values must be less than 256
            KB, and the maximum number of key-value pairs is 500.
        gateway_config (google.events.cloud.iot_v1.types.GatewayConfig):
            Gateway-related configuration and state.
    """

    id: str = proto.Field(
        proto.STRING,
        number=1,
    )
    name: str = proto.Field(
        proto.STRING,
        number=2,
    )
    num_id: int = proto.Field(
        proto.UINT64,
        number=3,
    )
    credentials: MutableSequence['DeviceCredential'] = proto.RepeatedField(
        proto.MESSAGE,
        number=12,
        message='DeviceCredential',
    )
    last_heartbeat_time: timestamp_pb2.Timestamp = proto.Field(
        proto.MESSAGE,
        number=7,
        message=timestamp_pb2.Timestamp,
    )
    last_event_time: timestamp_pb2.Timestamp = proto.Field(
        proto.MESSAGE,
        number=8,
        message=timestamp_pb2.Timestamp,
    )
    last_state_time: timestamp_pb2.Timestamp = proto.Field(
        proto.MESSAGE,
        number=20,
        message=timestamp_pb2.Timestamp,
    )
    last_config_ack_time: timestamp_pb2.Timestamp = proto.Field(
        proto.MESSAGE,
        number=14,
        message=timestamp_pb2.Timestamp,
    )
    last_config_send_time: timestamp_pb2.Timestamp = proto.Field(
        proto.MESSAGE,
        number=18,
        message=timestamp_pb2.Timestamp,
    )
    blocked: bool = proto.Field(
        proto.BOOL,
        number=19,
    )
    last_error_time: timestamp_pb2.Timestamp = proto.Field(
        proto.MESSAGE,
        number=10,
        message=timestamp_pb2.Timestamp,
    )
    last_error_status: status_pb2.Status = proto.Field(
        proto.MESSAGE,
        number=11,
        message=status_pb2.Status,
    )
    config: 'DeviceConfig' = proto.Field(
        proto.MESSAGE,
        number=13,
        message='DeviceConfig',
    )
    state: 'DeviceState' = proto.Field(
        proto.MESSAGE,
        number=16,
        message='DeviceState',
    )
    log_level: 'LogLevel' = proto.Field(
        proto.ENUM,
        number=21,
        enum='LogLevel',
    )
    metadata: MutableMapping[str, str] = proto.MapField(
        proto.STRING,
        proto.STRING,
        number=17,
    )
    gateway_config: 'GatewayConfig' = proto.Field(
        proto.MESSAGE,
        number=24,
        message='GatewayConfig',
    )


class GatewayConfig(proto.Message):
    r"""Gateway-related configuration and state.

    Attributes:
        gateway_type (google.events.cloud.iot_v1.types.GatewayType):
            Indicates whether the device is a gateway.
        gateway_auth_method (google.events.cloud.iot_v1.types.GatewayAuthMethod):
            Indicates how to authorize and/or
            authenticate devices to access the gateway.
        last_accessed_gateway_id (str):
            [Output only] The ID of the gateway the device accessed most
            recently.
        last_accessed_gateway_time (google.protobuf.timestamp_pb2.Timestamp):
            [Output only] The most recent time at which the device
            accessed the gateway specified in ``last_accessed_gateway``.
    """

    gateway_type: 'GatewayType' = proto.Field(
        proto.ENUM,
        number=1,
        enum='GatewayType',
    )
    gateway_auth_method: 'GatewayAuthMethod' = proto.Field(
        proto.ENUM,
        number=2,
        enum='GatewayAuthMethod',
    )
    last_accessed_gateway_id: str = proto.Field(
        proto.STRING,
        number=3,
    )
    last_accessed_gateway_time: timestamp_pb2.Timestamp = proto.Field(
        proto.MESSAGE,
        number=4,
        message=timestamp_pb2.Timestamp,
    )


class DeviceRegistry(proto.Message):
    r"""A container for a group of devices.

    Attributes:
        id (str):
            The identifier of this device registry. For example,
            ``myRegistry``.
        name (str):
            The resource path name. For example,
            ``projects/example-project/locations/us-central1/registries/my-registry``.
        event_notification_configs (MutableSequence[google.events.cloud.iot_v1.types.EventNotificationConfig]):
            The configuration for notification of
            telemetry events received from the device. All
            telemetry events that were successfully
            published by the device and acknowledged by
            Cloud IoT Core are guaranteed to be delivered to
            Cloud Pub/Sub. If multiple configurations match
            a message, only the first matching configuration
            is used. If you try to publish a device
            telemetry event using MQTT without specifying a
            Cloud Pub/Sub topic for the device's registry,
            the connection closes automatically. If you try
            to do so using an HTTP connection, an error is
            returned. Up to 10 configurations may be
            provided.
        state_notification_config (google.events.cloud.iot_v1.types.StateNotificationConfig):
            The configuration for notification of new
            states received from the device. State updates
            are guaranteed to be stored in the state
            history, but notifications to Cloud Pub/Sub are
            not guaranteed. For example, if permissions are
            misconfigured or the specified topic doesn't
            exist, no notification will be published but the
            state will still be stored in Cloud IoT Core.
        mqtt_config (google.events.cloud.iot_v1.types.MqttConfig):
            The MQTT configuration for this device
            registry.
        http_config (google.events.cloud.iot_v1.types.HttpConfig):
            The DeviceService (HTTP) configuration for
            this device registry.
        log_level (google.events.cloud.iot_v1.types.LogLevel):
            **Beta Feature**

            The default logging verbosity for activity from devices in
            this registry. The verbosity level can be overridden by
            Device.log_level.
        credentials (MutableSequence[google.events.cloud.iot_v1.types.RegistryCredential]):
            The credentials used to verify the device
            credentials. No more than 10 credentials can be
            bound to a single registry at a time. The
            verification process occurs at the time of
            device creation or update. If this field is
            empty, no verification is performed. Otherwise,
            the credentials of a newly created device or
            added credentials of an updated device should be
            signed with one of these registry credentials.

            Note, however, that existing devices will never
            be affected by modifications to this list of
            credentials: after a device has been
            successfully created in a registry, it should be
            able to connect even if its registry credentials
            are revoked, deleted, or modified.
    """

    id: str = proto.Field(
        proto.STRING,
        number=1,
    )
    name: str = proto.Field(
        proto.STRING,
        number=2,
    )
    event_notification_configs: MutableSequence['EventNotificationConfig'] = proto.RepeatedField(
        proto.MESSAGE,
        number=10,
        message='EventNotificationConfig',
    )
    state_notification_config: 'StateNotificationConfig' = proto.Field(
        proto.MESSAGE,
        number=7,
        message='StateNotificationConfig',
    )
    mqtt_config: 'MqttConfig' = proto.Field(
        proto.MESSAGE,
        number=4,
        message='MqttConfig',
    )
    http_config: 'HttpConfig' = proto.Field(
        proto.MESSAGE,
        number=9,
        message='HttpConfig',
    )
    log_level: 'LogLevel' = proto.Field(
        proto.ENUM,
        number=11,
        enum='LogLevel',
    )
    credentials: MutableSequence['RegistryCredential'] = proto.RepeatedField(
        proto.MESSAGE,
        number=8,
        message='RegistryCredential',
    )


class MqttConfig(proto.Message):
    r"""The configuration of MQTT for a device registry.

    Attributes:
        mqtt_enabled_state (google.events.cloud.iot_v1.types.MqttState):
            If enabled, allows connections using the MQTT
            protocol. Otherwise, MQTT connections to this
            registry will fail.
    """

    mqtt_enabled_state: 'MqttState' = proto.Field(
        proto.ENUM,
        number=1,
        enum='MqttState',
    )


class HttpConfig(proto.Message):
    r"""The configuration of the HTTP bridge for a device registry.

    Attributes:
        http_enabled_state (google.events.cloud.iot_v1.types.HttpState):
            If enabled, allows devices to use
            DeviceService via the HTTP protocol. Otherwise,
            any requests to DeviceService will fail for this
            registry.
    """

    http_enabled_state: 'HttpState' = proto.Field(
        proto.ENUM,
        number=1,
        enum='HttpState',
    )


class EventNotificationConfig(proto.Message):
    r"""The configuration for forwarding telemetry events.

    Attributes:
        subfolder_matches (str):
            If the subfolder name matches this string
            exactly, this configuration will be used. The
            string must not include the leading '/'
            character. If empty, all strings are matched.
            This field is used only for telemetry events;
            subfolders are not supported for state changes.
        pubsub_topic_name (str):
            A Cloud Pub/Sub topic name. For example,
            ``projects/myProject/topics/deviceEvents``.
    """

    subfolder_matches: str = proto.Field(
        proto.STRING,
        number=2,
    )
    pubsub_topic_name: str = proto.Field(
        proto.STRING,
        number=1,
    )


class StateNotificationConfig(proto.Message):
    r"""The configuration for notification of new states received
    from the device.

    Attributes:
        pubsub_topic_name (str):
            A Cloud Pub/Sub topic name. For example,
            ``projects/myProject/topics/deviceEvents``.
    """

    pubsub_topic_name: str = proto.Field(
        proto.STRING,
        number=1,
    )


class RegistryCredential(proto.Message):
    r"""A server-stored registry credential used to validate device
    credentials.


    .. _oneof: https://proto-plus-python.readthedocs.io/en/stable/fields.html#oneofs-mutually-exclusive-fields

    Attributes:
        public_key_certificate (google.events.cloud.iot_v1.types.PublicKeyCertificate):
            A public key certificate used to verify the
            device credentials.

            This field is a member of `oneof`_ ``credential``.
    """

    public_key_certificate: 'PublicKeyCertificate' = proto.Field(
        proto.MESSAGE,
        number=1,
        oneof='credential',
        message='PublicKeyCertificate',
    )


class X509CertificateDetails(proto.Message):
    r"""Details of an X.509 certificate. For informational purposes
    only.

    Attributes:
        issuer (str):
            The entity that signed the certificate.
        subject (str):
            The entity the certificate and public key
            belong to.
        start_time (google.protobuf.timestamp_pb2.Timestamp):
            The time the certificate becomes valid.
        expiry_time (google.protobuf.timestamp_pb2.Timestamp):
            The time the certificate becomes invalid.
        signature_algorithm (str):
            The algorithm used to sign the certificate.
        public_key_type (str):
            The type of public key in the certificate.
    """

    issuer: str = proto.Field(
        proto.STRING,
        number=1,
    )
    subject: str = proto.Field(
        proto.STRING,
        number=2,
    )
    start_time: timestamp_pb2.Timestamp = proto.Field(
        proto.MESSAGE,
        number=3,
        message=timestamp_pb2.Timestamp,
    )
    expiry_time: timestamp_pb2.Timestamp = proto.Field(
        proto.MESSAGE,
        number=4,
        message=timestamp_pb2.Timestamp,
    )
    signature_algorithm: str = proto.Field(
        proto.STRING,
        number=5,
    )
    public_key_type: str = proto.Field(
        proto.STRING,
        number=6,
    )


class PublicKeyCertificate(proto.Message):
    r"""A public key certificate format and data.

    Attributes:
        format_ (google.events.cloud.iot_v1.types.PublicKeyCertificateFormat):
            The certificate format.
        certificate (str):
            The certificate data.
        x509_details (google.events.cloud.iot_v1.types.X509CertificateDetails):
            [Output only] The certificate details. Used only for X.509
            certificates.
    """

    format_: 'PublicKeyCertificateFormat' = proto.Field(
        proto.ENUM,
        number=1,
        enum='PublicKeyCertificateFormat',
    )
    certificate: str = proto.Field(
        proto.STRING,
        number=2,
    )
    x509_details: 'X509CertificateDetails' = proto.Field(
        proto.MESSAGE,
        number=3,
        message='X509CertificateDetails',
    )


class DeviceCredential(proto.Message):
    r"""A server-stored device credential used for authentication.

    .. _oneof: https://proto-plus-python.readthedocs.io/en/stable/fields.html#oneofs-mutually-exclusive-fields

    Attributes:
        public_key (google.events.cloud.iot_v1.types.PublicKeyCredential):
            A public key used to verify the signature of
            JSON Web Tokens (JWTs). When adding a new device
            credential, either via device creation or via
            modifications, this public key credential may be
            required to be signed by one of the registry
            level certificates. More specifically, if the
            registry contains at least one certificate, any
            new device credential must be signed by one of
            the registry certificates. As a result, when the
            registry contains certificates, only X.509
            certificates are accepted as device credentials.
            However, if the registry does not contain a
            certificate, self-signed certificates and public
            keys will be accepted. New device credentials
            must be different from every registry-level
            certificate.

            This field is a member of `oneof`_ ``credential``.
        expiration_time (google.protobuf.timestamp_pb2.Timestamp):
            [Optional] The time at which this credential becomes
            invalid. This credential will be ignored for new client
            authentication requests after this timestamp; however, it
            will not be automatically deleted.
    """

    public_key: 'PublicKeyCredential' = proto.Field(
        proto.MESSAGE,
        number=2,
        oneof='credential',
        message='PublicKeyCredential',
    )
    expiration_time: timestamp_pb2.Timestamp = proto.Field(
        proto.MESSAGE,
        number=6,
        message=timestamp_pb2.Timestamp,
    )


class PublicKeyCredential(proto.Message):
    r"""A public key format and data.

    Attributes:
        format_ (google.events.cloud.iot_v1.types.PublicKeyFormat):
            The format of the key.
        key (str):
            The key data.
    """

    format_: 'PublicKeyFormat' = proto.Field(
        proto.ENUM,
        number=1,
        enum='PublicKeyFormat',
    )
    key: str = proto.Field(
        proto.STRING,
        number=2,
    )


class DeviceConfig(proto.Message):
    r"""The device configuration. Eventually delivered to devices.

    Attributes:
        version (int):
            [Output only] The version of this update. The version number
            is assigned by the server, and is always greater than 0
            after device creation. The version must be 0 on the
            ``CreateDevice`` request if a ``config`` is specified; the
            response of ``CreateDevice`` will always have a value of 1.
        cloud_update_time (google.protobuf.timestamp_pb2.Timestamp):
            [Output only] The time at which this configuration version
            was updated in Cloud IoT Core. This timestamp is set by the
            server.
        device_ack_time (google.protobuf.timestamp_pb2.Timestamp):
            [Output only] The time at which Cloud IoT Core received the
            acknowledgment from the device, indicating that the device
            has received this configuration version. If this field is
            not present, the device has not yet acknowledged that it
            received this version. Note that when the config was sent to
            the device, many config versions may have been available in
            Cloud IoT Core while the device was disconnected, and on
            connection, only the latest version is sent to the device.
            Some versions may never be sent to the device, and therefore
            are never acknowledged. This timestamp is set by Cloud IoT
            Core.
        binary_data (bytes):
            The device configuration data.
    """

    version: int = proto.Field(
        proto.INT64,
        number=1,
    )
    cloud_update_time: timestamp_pb2.Timestamp = proto.Field(
        proto.MESSAGE,
        number=2,
        message=timestamp_pb2.Timestamp,
    )
    device_ack_time: timestamp_pb2.Timestamp = proto.Field(
        proto.MESSAGE,
        number=3,
        message=timestamp_pb2.Timestamp,
    )
    binary_data: bytes = proto.Field(
        proto.BYTES,
        number=4,
    )


class DeviceState(proto.Message):
    r"""The device state, as reported by the device.

    Attributes:
        update_time (google.protobuf.timestamp_pb2.Timestamp):
            [Output only] The time at which this state version was
            updated in Cloud IoT Core.
        binary_data (bytes):
            The device state data.
    """

    update_time: timestamp_pb2.Timestamp = proto.Field(
        proto.MESSAGE,
        number=1,
        message=timestamp_pb2.Timestamp,
    )
    binary_data: bytes = proto.Field(
        proto.BYTES,
        number=2,
    )


class DeviceEventData(proto.Message):
    r"""The data within all Cloud IoT Device events.

    .. _oneof: https://proto-plus-python.readthedocs.io/en/stable/fields.html#oneofs-mutually-exclusive-fields

    Attributes:
        payload (google.events.cloud.iot_v1.types.Device):
            Optional. The Device event payload. Unset for
            deletion events.

            This field is a member of `oneof`_ ``_payload``.
    """

    payload: 'Device' = proto.Field(
        proto.MESSAGE,
        number=1,
        optional=True,
        message='Device',
    )


class RegistryEventData(proto.Message):
    r"""The data within all Cloud IoT Registry events.

    .. _oneof: https://proto-plus-python.readthedocs.io/en/stable/fields.html#oneofs-mutually-exclusive-fields

    Attributes:
        payload (google.events.cloud.iot_v1.types.DeviceRegistry):
            Optional. The Registry event payload. Unset
            for deletion events.

            This field is a member of `oneof`_ ``_payload``.
    """

    payload: 'DeviceRegistry' = proto.Field(
        proto.MESSAGE,
        number=1,
        optional=True,
        message='DeviceRegistry',
    )


__all__ = tuple(sorted(__protobuf__.manifest))
