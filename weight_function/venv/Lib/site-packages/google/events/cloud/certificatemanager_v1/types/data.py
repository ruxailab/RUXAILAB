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

from google.protobuf import duration_pb2  # type: ignore
from google.protobuf import timestamp_pb2  # type: ignore


__protobuf__ = proto.module(
    package='google.events.cloud.certificatemanager.v1',
    manifest={
        'ServingState',
        'CertificateIssuanceConfig',
        'Certificate',
        'CertificateMap',
        'CertificateMapEntry',
        'DnsAuthorization',
        'DnsAuthorizationEventData',
        'CertificateIssuanceConfigEventData',
        'CertificateMapEntryEventData',
        'CertificateMapEventData',
        'CertificateEventData',
    },
)


class ServingState(proto.Enum):
    r"""Defines set of serving states associated with a resource.

    Values:
        SERVING_STATE_UNSPECIFIED (0):
            The status is undefined.
        ACTIVE (1):
            The configuration is serving.
        PENDING (2):
            Update is in progress. Some frontends may
            serve this configuration.
    """
    SERVING_STATE_UNSPECIFIED = 0
    ACTIVE = 1
    PENDING = 2


class CertificateIssuanceConfig(proto.Message):
    r"""CertificateIssuanceConfig specifies how to issue and manage a
    certificate.

    Attributes:
        name (str):
            A user-defined name of the certificate issuance config.
            CertificateIssuanceConfig names must be unique globally and
            match pattern
            ``projects/*/locations/*/certificateIssuanceConfigs/*``.
        create_time (google.protobuf.timestamp_pb2.Timestamp):
            Output only. The creation timestamp of a
            CertificateIssuanceConfig.
        update_time (google.protobuf.timestamp_pb2.Timestamp):
            Output only. The last update timestamp of a
            CertificateIssuanceConfig.
        labels (MutableMapping[str, str]):
            Set of labels associated with a
            CertificateIssuanceConfig.
        description (str):
            One or more paragraphs of text description of
            a CertificateIssuanceConfig.
        certificate_authority_config (google.events.cloud.certificatemanager_v1.types.CertificateIssuanceConfig.CertificateAuthorityConfig):
            Required. The CA that issues the workload
            certificate. It includes the CA address, type,
            authentication to CA service, etc.
        lifetime (google.protobuf.duration_pb2.Duration):
            Required. Workload certificate lifetime
            requested.
        rotation_window_percentage (int):
            Required. Specifies the percentage of elapsed
            time of the certificate lifetime to wait before
            renewing the certificate. Must be a number
            between 1-99, inclusive.
        key_algorithm (google.events.cloud.certificatemanager_v1.types.CertificateIssuanceConfig.KeyAlgorithm):
            Required. The key algorithm to use when
            generating the private key.
    """
    class KeyAlgorithm(proto.Enum):
        r"""The type of keypair to generate.

        Values:
            KEY_ALGORITHM_UNSPECIFIED (0):
                Unspecified key algorithm.
            RSA_2048 (1):
                Specifies RSA with a 2048-bit modulus.
            ECDSA_P256 (4):
                Specifies ECDSA with curve P256.
        """
        KEY_ALGORITHM_UNSPECIFIED = 0
        RSA_2048 = 1
        ECDSA_P256 = 4

    class CertificateAuthorityConfig(proto.Message):
        r"""The CA that issues the workload certificate. It includes CA
        address, type, authentication to CA service, etc.


        .. _oneof: https://proto-plus-python.readthedocs.io/en/stable/fields.html#oneofs-mutually-exclusive-fields

        Attributes:
            certificate_authority_service_config (google.events.cloud.certificatemanager_v1.types.CertificateIssuanceConfig.CertificateAuthorityConfig.CertificateAuthorityServiceConfig):
                Defines a CertificateAuthorityServiceConfig.

                This field is a member of `oneof`_ ``kind``.
        """

        class CertificateAuthorityServiceConfig(proto.Message):
            r"""Contains information required to contact CA service.

            Attributes:
                ca_pool (str):
                    Required. A CA pool resource used to issue a certificate.
                    The CA pool string has a relative resource path following
                    the form
                    "projects/{project}/locations/{location}/caPools/{ca_pool}".
            """

            ca_pool: str = proto.Field(
                proto.STRING,
                number=1,
            )

        certificate_authority_service_config: 'CertificateIssuanceConfig.CertificateAuthorityConfig.CertificateAuthorityServiceConfig' = proto.Field(
            proto.MESSAGE,
            number=1,
            oneof='kind',
            message='CertificateIssuanceConfig.CertificateAuthorityConfig.CertificateAuthorityServiceConfig',
        )

    name: str = proto.Field(
        proto.STRING,
        number=1,
    )
    create_time: timestamp_pb2.Timestamp = proto.Field(
        proto.MESSAGE,
        number=2,
        message=timestamp_pb2.Timestamp,
    )
    update_time: timestamp_pb2.Timestamp = proto.Field(
        proto.MESSAGE,
        number=3,
        message=timestamp_pb2.Timestamp,
    )
    labels: MutableMapping[str, str] = proto.MapField(
        proto.STRING,
        proto.STRING,
        number=4,
    )
    description: str = proto.Field(
        proto.STRING,
        number=5,
    )
    certificate_authority_config: CertificateAuthorityConfig = proto.Field(
        proto.MESSAGE,
        number=6,
        message=CertificateAuthorityConfig,
    )
    lifetime: duration_pb2.Duration = proto.Field(
        proto.MESSAGE,
        number=7,
        message=duration_pb2.Duration,
    )
    rotation_window_percentage: int = proto.Field(
        proto.INT32,
        number=8,
    )
    key_algorithm: KeyAlgorithm = proto.Field(
        proto.ENUM,
        number=9,
        enum=KeyAlgorithm,
    )


class Certificate(proto.Message):
    r"""Defines TLS certificate.

    This message has `oneof`_ fields (mutually exclusive fields).
    For each oneof, at most one member field can be set at the same time.
    Setting any member of the oneof automatically clears all other
    members.

    .. _oneof: https://proto-plus-python.readthedocs.io/en/stable/fields.html#oneofs-mutually-exclusive-fields

    Attributes:
        name (str):
            A user-defined name of the certificate. Certificate names
            must be unique globally and match pattern
            ``projects/*/locations/*/certificates/*``.
        description (str):
            One or more paragraphs of text description of
            a certificate.
        create_time (google.protobuf.timestamp_pb2.Timestamp):
            Output only. The creation timestamp of a
            Certificate.
        update_time (google.protobuf.timestamp_pb2.Timestamp):
            Output only. The last update timestamp of a
            Certificate.
        labels (MutableMapping[str, str]):
            Set of labels associated with a Certificate.
        self_managed (google.events.cloud.certificatemanager_v1.types.Certificate.SelfManagedCertificate):
            If set, defines data of a self-managed
            certificate.

            This field is a member of `oneof`_ ``type``.
        managed (google.events.cloud.certificatemanager_v1.types.Certificate.ManagedCertificate):
            If set, contains configuration and state of a
            managed certificate.

            This field is a member of `oneof`_ ``type``.
        san_dnsnames (MutableSequence[str]):
            Output only. The list of Subject Alternative
            Names of dnsName type defined in the certificate
            (see RFC 5280 4.2.1.6). Managed certificates
            that haven't been provisioned yet have this
            field populated with a value of the
            managed.domains field.
        pem_certificate (str):
            Output only. The PEM-encoded certificate
            chain.
        expire_time (google.protobuf.timestamp_pb2.Timestamp):
            Output only. The expiry timestamp of a
            Certificate.
        scope (google.events.cloud.certificatemanager_v1.types.Certificate.Scope):
            Immutable. The scope of the certificate.
    """
    class Scope(proto.Enum):
        r"""Certificate scope.

        Values:
            DEFAULT (0):
                Certificates with default scope are served
                from core Google data centers. If unsure, choose
                this option.
            EDGE_CACHE (1):
                Certificates with scope EDGE_CACHE are special-purposed
                certificates, served from non-core Google data centers.
        """
        DEFAULT = 0
        EDGE_CACHE = 1

    class SelfManagedCertificate(proto.Message):
        r"""Certificate data for a SelfManaged Certificate.
        SelfManaged Certificates are uploaded by the user. Updating such
        certificates before they expire remains the user's
        responsibility.

        """

    class ManagedCertificate(proto.Message):
        r"""Configuration and state of a Managed Certificate.
        Certificate Manager provisions and renews Managed Certificates
        automatically, for as long as it's authorized to do so.

        Attributes:
            domains (MutableSequence[str]):
                Immutable. The domains for which a managed
                SSL certificate will be generated. Wildcard
                domains are only supported with DNS challenge
                resolution.
            dns_authorizations (MutableSequence[str]):
                Immutable. Authorizations that will be used
                for performing domain authorization.
            issuance_config (str):
                Immutable. The resource name for a
                [CertificateIssuanceConfig][google.cloud.certificatemanager.v1.CertificateIssuanceConfig]
                used to configure private PKI certificates in the format
                ``projects/*/locations/*/certificateIssuanceConfigs/*``. If
                this field is not set, the certificates will instead be
                publicly signed as documented at
                https://cloud.google.com/load-balancing/docs/ssl-certificates/google-managed-certs#caa.
            state (google.events.cloud.certificatemanager_v1.types.Certificate.ManagedCertificate.State):
                Output only. State of the managed certificate
                resource.
            provisioning_issue (google.events.cloud.certificatemanager_v1.types.Certificate.ManagedCertificate.ProvisioningIssue):
                Output only. Information about issues with
                provisioning a Managed Certificate.
            authorization_attempt_info (MutableSequence[google.events.cloud.certificatemanager_v1.types.Certificate.ManagedCertificate.AuthorizationAttemptInfo]):
                Output only. Detailed state of the latest
                authorization attempt for each domain specified
                for managed certificate resource.
        """
        class State(proto.Enum):
            r"""

            Values:
                STATE_UNSPECIFIED (0):
                    No description available.
                PROVISIONING (1):
                    Certificate Manager attempts to provision or renew the
                    certificate. If the process takes longer than expected,
                    consult the ``provisioning_issue`` field.
                FAILED (2):
                    Multiple certificate provisioning attempts failed and
                    Certificate Manager gave up. To try again, delete and create
                    a new managed Certificate resource. For details see the
                    ``provisioning_issue`` field.
                ACTIVE (3):
                    The certificate management is working, and a
                    certificate has been provisioned.
            """
            STATE_UNSPECIFIED = 0
            PROVISIONING = 1
            FAILED = 2
            ACTIVE = 3

        class ProvisioningIssue(proto.Message):
            r"""Information about issues with provisioning a Managed
            Certificate.

            Attributes:
                reason (google.events.cloud.certificatemanager_v1.types.Certificate.ManagedCertificate.ProvisioningIssue.Reason):
                    Output only. Reason for provisioning
                    failures.
                details (str):
                    Output only. Human readable explanation about
                    the issue. Provided to help address the
                    configuration issues. Not guaranteed to be
                    stable. For programmatic access use Reason enum.
            """
            class Reason(proto.Enum):
                r"""

                Values:
                    REASON_UNSPECIFIED (0):
                        No description available.
                    AUTHORIZATION_ISSUE (1):
                        Certificate provisioning failed due to an issue with one or
                        more of the domains on the certificate. For details of which
                        domains failed, consult the ``authorization_attempt_info``
                        field.
                    RATE_LIMITED (2):
                        Exceeded Certificate Authority quotas or
                        internal rate limits of the system. Provisioning
                        may take longer to complete.
                """
                REASON_UNSPECIFIED = 0
                AUTHORIZATION_ISSUE = 1
                RATE_LIMITED = 2

            reason: 'Certificate.ManagedCertificate.ProvisioningIssue.Reason' = proto.Field(
                proto.ENUM,
                number=1,
                enum='Certificate.ManagedCertificate.ProvisioningIssue.Reason',
            )
            details: str = proto.Field(
                proto.STRING,
                number=2,
            )

        class AuthorizationAttemptInfo(proto.Message):
            r"""State of the latest attempt to authorize a domain for
            certificate issuance.

            Attributes:
                domain (str):
                    Domain name of the authorization attempt.
                state (google.events.cloud.certificatemanager_v1.types.Certificate.ManagedCertificate.AuthorizationAttemptInfo.State):
                    Output only. State of the domain for managed
                    certificate issuance.
                failure_reason (google.events.cloud.certificatemanager_v1.types.Certificate.ManagedCertificate.AuthorizationAttemptInfo.FailureReason):
                    Output only. Reason for failure of the
                    authorization attempt for the domain.
                details (str):
                    Output only. Human readable explanation for
                    reaching the state. Provided to help address the
                    configuration issues. Not guaranteed to be
                    stable. For programmatic access use
                    FailureReason enum.
            """
            class State(proto.Enum):
                r"""

                Values:
                    STATE_UNSPECIFIED (0):
                        No description available.
                    AUTHORIZING (1):
                        Certificate provisioning for this domain is
                        under way. GCP will attempt to authorize the
                        domain.
                    AUTHORIZED (6):
                        A managed certificate can be provisioned, no
                        issues for this domain.
                    FAILED (7):
                        Attempt to authorize the domain failed. This prevents the
                        Managed Certificate from being issued. See
                        ``failure_reason`` and ``details`` fields for more
                        information.
                """
                STATE_UNSPECIFIED = 0
                AUTHORIZING = 1
                AUTHORIZED = 6
                FAILED = 7

            class FailureReason(proto.Enum):
                r"""

                Values:
                    FAILURE_REASON_UNSPECIFIED (0):
                        No description available.
                    CONFIG (1):
                        There was a problem with the user's DNS or
                        load balancer configuration for this domain.
                    CAA (2):
                        Certificate issuance forbidden by an explicit
                        CAA record for the domain or a failure to check
                        CAA records for the domain.
                    RATE_LIMITED (3):
                        Reached a CA or internal rate-limit for the
                        domain, e.g. for certificates per top-level
                        private domain.
                """
                FAILURE_REASON_UNSPECIFIED = 0
                CONFIG = 1
                CAA = 2
                RATE_LIMITED = 3

            domain: str = proto.Field(
                proto.STRING,
                number=1,
            )
            state: 'Certificate.ManagedCertificate.AuthorizationAttemptInfo.State' = proto.Field(
                proto.ENUM,
                number=2,
                enum='Certificate.ManagedCertificate.AuthorizationAttemptInfo.State',
            )
            failure_reason: 'Certificate.ManagedCertificate.AuthorizationAttemptInfo.FailureReason' = proto.Field(
                proto.ENUM,
                number=3,
                enum='Certificate.ManagedCertificate.AuthorizationAttemptInfo.FailureReason',
            )
            details: str = proto.Field(
                proto.STRING,
                number=4,
            )

        domains: MutableSequence[str] = proto.RepeatedField(
            proto.STRING,
            number=1,
        )
        dns_authorizations: MutableSequence[str] = proto.RepeatedField(
            proto.STRING,
            number=2,
        )
        issuance_config: str = proto.Field(
            proto.STRING,
            number=6,
        )
        state: 'Certificate.ManagedCertificate.State' = proto.Field(
            proto.ENUM,
            number=4,
            enum='Certificate.ManagedCertificate.State',
        )
        provisioning_issue: 'Certificate.ManagedCertificate.ProvisioningIssue' = proto.Field(
            proto.MESSAGE,
            number=3,
            message='Certificate.ManagedCertificate.ProvisioningIssue',
        )
        authorization_attempt_info: MutableSequence['Certificate.ManagedCertificate.AuthorizationAttemptInfo'] = proto.RepeatedField(
            proto.MESSAGE,
            number=5,
            message='Certificate.ManagedCertificate.AuthorizationAttemptInfo',
        )

    name: str = proto.Field(
        proto.STRING,
        number=1,
    )
    description: str = proto.Field(
        proto.STRING,
        number=8,
    )
    create_time: timestamp_pb2.Timestamp = proto.Field(
        proto.MESSAGE,
        number=2,
        message=timestamp_pb2.Timestamp,
    )
    update_time: timestamp_pb2.Timestamp = proto.Field(
        proto.MESSAGE,
        number=3,
        message=timestamp_pb2.Timestamp,
    )
    labels: MutableMapping[str, str] = proto.MapField(
        proto.STRING,
        proto.STRING,
        number=4,
    )
    self_managed: SelfManagedCertificate = proto.Field(
        proto.MESSAGE,
        number=5,
        oneof='type',
        message=SelfManagedCertificate,
    )
    managed: ManagedCertificate = proto.Field(
        proto.MESSAGE,
        number=11,
        oneof='type',
        message=ManagedCertificate,
    )
    san_dnsnames: MutableSequence[str] = proto.RepeatedField(
        proto.STRING,
        number=6,
    )
    pem_certificate: str = proto.Field(
        proto.STRING,
        number=9,
    )
    expire_time: timestamp_pb2.Timestamp = proto.Field(
        proto.MESSAGE,
        number=7,
        message=timestamp_pb2.Timestamp,
    )
    scope: Scope = proto.Field(
        proto.ENUM,
        number=12,
        enum=Scope,
    )


class CertificateMap(proto.Message):
    r"""Defines a collection of certificate configurations.

    Attributes:
        name (str):
            A user-defined name of the Certificate Map. Certificate Map
            names must be unique globally and match pattern
            ``projects/*/locations/*/certificateMaps/*``.
        description (str):
            One or more paragraphs of text description of
            a certificate map.
        create_time (google.protobuf.timestamp_pb2.Timestamp):
            Output only. The creation timestamp of a
            Certificate Map.
        update_time (google.protobuf.timestamp_pb2.Timestamp):
            Output only. The update timestamp of a
            Certificate Map.
        labels (MutableMapping[str, str]):
            Set of labels associated with a Certificate
            Map.
        gclb_targets (MutableSequence[google.events.cloud.certificatemanager_v1.types.CertificateMap.GclbTarget]):
            Output only. A list of GCLB targets that use
            this Certificate Map. A Target Proxy is only
            present on this list if it's attached to a
            Forwarding Rule.
    """

    class GclbTarget(proto.Message):
        r"""Describes a Target Proxy that uses this Certificate Map.

        This message has `oneof`_ fields (mutually exclusive fields).
        For each oneof, at most one member field can be set at the same time.
        Setting any member of the oneof automatically clears all other
        members.

        .. _oneof: https://proto-plus-python.readthedocs.io/en/stable/fields.html#oneofs-mutually-exclusive-fields

        Attributes:
            target_https_proxy (str):
                Output only. This field returns the resource name in the
                following format:
                ``//compute.googleapis.com/projects/*/global/targetHttpsProxies/*``.

                This field is a member of `oneof`_ ``target_proxy``.
            target_ssl_proxy (str):
                Output only. This field returns the resource name in the
                following format:
                ``//compute.googleapis.com/projects/*/global/targetSslProxies/*``.

                This field is a member of `oneof`_ ``target_proxy``.
            ip_configs (MutableSequence[google.events.cloud.certificatemanager_v1.types.CertificateMap.GclbTarget.IpConfig]):
                Output only. IP configurations for this
                Target Proxy where the Certificate Map is
                serving.
        """

        class IpConfig(proto.Message):
            r"""Defines IP configuration where this Certificate Map is
            serving.

            Attributes:
                ip_address (str):
                    Output only. An external IP address.
                ports (MutableSequence[int]):
                    Output only. Ports.
            """

            ip_address: str = proto.Field(
                proto.STRING,
                number=1,
            )
            ports: MutableSequence[int] = proto.RepeatedField(
                proto.UINT32,
                number=3,
            )

        target_https_proxy: str = proto.Field(
            proto.STRING,
            number=1,
            oneof='target_proxy',
        )
        target_ssl_proxy: str = proto.Field(
            proto.STRING,
            number=3,
            oneof='target_proxy',
        )
        ip_configs: MutableSequence['CertificateMap.GclbTarget.IpConfig'] = proto.RepeatedField(
            proto.MESSAGE,
            number=2,
            message='CertificateMap.GclbTarget.IpConfig',
        )

    name: str = proto.Field(
        proto.STRING,
        number=1,
    )
    description: str = proto.Field(
        proto.STRING,
        number=5,
    )
    create_time: timestamp_pb2.Timestamp = proto.Field(
        proto.MESSAGE,
        number=2,
        message=timestamp_pb2.Timestamp,
    )
    update_time: timestamp_pb2.Timestamp = proto.Field(
        proto.MESSAGE,
        number=6,
        message=timestamp_pb2.Timestamp,
    )
    labels: MutableMapping[str, str] = proto.MapField(
        proto.STRING,
        proto.STRING,
        number=3,
    )
    gclb_targets: MutableSequence[GclbTarget] = proto.RepeatedField(
        proto.MESSAGE,
        number=4,
        message=GclbTarget,
    )


class CertificateMapEntry(proto.Message):
    r"""Defines a certificate map entry.

    This message has `oneof`_ fields (mutually exclusive fields).
    For each oneof, at most one member field can be set at the same time.
    Setting any member of the oneof automatically clears all other
    members.

    .. _oneof: https://proto-plus-python.readthedocs.io/en/stable/fields.html#oneofs-mutually-exclusive-fields

    Attributes:
        name (str):
            A user-defined name of the Certificate Map Entry.
            Certificate Map Entry names must be unique globally and
            match pattern
            ``projects/*/locations/*/certificateMaps/*/certificateMapEntries/*``.
        description (str):
            One or more paragraphs of text description of
            a certificate map entry.
        create_time (google.protobuf.timestamp_pb2.Timestamp):
            Output only. The creation timestamp of a
            Certificate Map Entry.
        update_time (google.protobuf.timestamp_pb2.Timestamp):
            Output only. The update timestamp of a
            Certificate Map Entry.
        labels (MutableMapping[str, str]):
            Set of labels associated with a Certificate
            Map Entry.
        hostname (str):
            A Hostname (FQDN, e.g. ``example.com``) or a wildcard
            hostname expression (``*.example.com``) for a set of
            hostnames with common suffix. Used as Server Name Indication
            (SNI) for selecting a proper certificate.

            This field is a member of `oneof`_ ``match``.
        matcher (google.events.cloud.certificatemanager_v1.types.CertificateMapEntry.Matcher):
            A predefined matcher for particular cases,
            other than SNI selection.

            This field is a member of `oneof`_ ``match``.
        certificates (MutableSequence[str]):
            A set of Certificates defines for the given ``hostname``.
            There can be defined up to fifteen certificates in each
            Certificate Map Entry. Each certificate must match pattern
            ``projects/*/locations/*/certificates/*``.
        state (google.events.cloud.certificatemanager_v1.types.ServingState):
            Output only. A serving state of this
            Certificate Map Entry.
    """
    class Matcher(proto.Enum):
        r"""Defines predefined cases other than SNI-hostname match when
        this configuration should be applied.

        Values:
            MATCHER_UNSPECIFIED (0):
                A matcher has't been recognized.
            PRIMARY (1):
                A primary certificate that is served when SNI
                wasn't specified in the request or SNI couldn't
                be found in the map.
        """
        MATCHER_UNSPECIFIED = 0
        PRIMARY = 1

    name: str = proto.Field(
        proto.STRING,
        number=1,
    )
    description: str = proto.Field(
        proto.STRING,
        number=9,
    )
    create_time: timestamp_pb2.Timestamp = proto.Field(
        proto.MESSAGE,
        number=2,
        message=timestamp_pb2.Timestamp,
    )
    update_time: timestamp_pb2.Timestamp = proto.Field(
        proto.MESSAGE,
        number=3,
        message=timestamp_pb2.Timestamp,
    )
    labels: MutableMapping[str, str] = proto.MapField(
        proto.STRING,
        proto.STRING,
        number=4,
    )
    hostname: str = proto.Field(
        proto.STRING,
        number=5,
        oneof='match',
    )
    matcher: Matcher = proto.Field(
        proto.ENUM,
        number=10,
        oneof='match',
        enum=Matcher,
    )
    certificates: MutableSequence[str] = proto.RepeatedField(
        proto.STRING,
        number=7,
    )
    state: 'ServingState' = proto.Field(
        proto.ENUM,
        number=8,
        enum='ServingState',
    )


class DnsAuthorization(proto.Message):
    r"""A DnsAuthorization resource describes a way to perform domain
    authorization for certificate issuance.

    Attributes:
        name (str):
            A user-defined name of the dns authorization.
            DnsAuthorization names must be unique globally and match
            pattern ``projects/*/locations/*/dnsAuthorizations/*``.
        create_time (google.protobuf.timestamp_pb2.Timestamp):
            Output only. The creation timestamp of a
            DnsAuthorization.
        update_time (google.protobuf.timestamp_pb2.Timestamp):
            Output only. The last update timestamp of a
            DnsAuthorization.
        labels (MutableMapping[str, str]):
            Set of labels associated with a
            DnsAuthorization.
        description (str):
            One or more paragraphs of text description of
            a DnsAuthorization.
        domain (str):
            Required. Immutable. A domain that is being authorized. A
            DnsAuthorization resource covers a single domain and its
            wildcard, e.g. authorization for ``example.com`` can be used
            to issue certificates for ``example.com`` and
            ``*.example.com``.
        dns_resource_record (google.events.cloud.certificatemanager_v1.types.DnsAuthorization.DnsResourceRecord):
            Output only. DNS Resource Record that needs
            to be added to DNS configuration.
    """

    class DnsResourceRecord(proto.Message):
        r"""The structure describing the DNS Resource Record that needs
        to be added to DNS configuration for the authorization to be
        usable by certificate.

        Attributes:
            name (str):
                Output only. Fully qualified name of the DNS Resource
                Record. e.g. ``_acme-challenge.example.com``
            type_ (str):
                Output only. Type of the DNS Resource Record.
                Currently always set to "CNAME".
            data (str):
                Output only. Data of the DNS Resource Record.
        """

        name: str = proto.Field(
            proto.STRING,
            number=1,
        )
        type_: str = proto.Field(
            proto.STRING,
            number=2,
        )
        data: str = proto.Field(
            proto.STRING,
            number=3,
        )

    name: str = proto.Field(
        proto.STRING,
        number=1,
    )
    create_time: timestamp_pb2.Timestamp = proto.Field(
        proto.MESSAGE,
        number=2,
        message=timestamp_pb2.Timestamp,
    )
    update_time: timestamp_pb2.Timestamp = proto.Field(
        proto.MESSAGE,
        number=3,
        message=timestamp_pb2.Timestamp,
    )
    labels: MutableMapping[str, str] = proto.MapField(
        proto.STRING,
        proto.STRING,
        number=4,
    )
    description: str = proto.Field(
        proto.STRING,
        number=5,
    )
    domain: str = proto.Field(
        proto.STRING,
        number=6,
    )
    dns_resource_record: DnsResourceRecord = proto.Field(
        proto.MESSAGE,
        number=10,
        message=DnsResourceRecord,
    )


class DnsAuthorizationEventData(proto.Message):
    r"""The data within all DnsAuthorization events.

    .. _oneof: https://proto-plus-python.readthedocs.io/en/stable/fields.html#oneofs-mutually-exclusive-fields

    Attributes:
        payload (google.events.cloud.certificatemanager_v1.types.DnsAuthorization):
            Optional. The DnsAuthorization event payload.
            Unset for deletion events.

            This field is a member of `oneof`_ ``_payload``.
    """

    payload: 'DnsAuthorization' = proto.Field(
        proto.MESSAGE,
        number=1,
        optional=True,
        message='DnsAuthorization',
    )


class CertificateIssuanceConfigEventData(proto.Message):
    r"""The data within all CertificateIssuanceConfig events.

    .. _oneof: https://proto-plus-python.readthedocs.io/en/stable/fields.html#oneofs-mutually-exclusive-fields

    Attributes:
        payload (google.events.cloud.certificatemanager_v1.types.CertificateIssuanceConfig):
            Optional. The CertificateIssuanceConfig event
            payload. Unset for deletion events.

            This field is a member of `oneof`_ ``_payload``.
    """

    payload: 'CertificateIssuanceConfig' = proto.Field(
        proto.MESSAGE,
        number=1,
        optional=True,
        message='CertificateIssuanceConfig',
    )


class CertificateMapEntryEventData(proto.Message):
    r"""The data within all CertificateMapEntry events.

    .. _oneof: https://proto-plus-python.readthedocs.io/en/stable/fields.html#oneofs-mutually-exclusive-fields

    Attributes:
        payload (google.events.cloud.certificatemanager_v1.types.CertificateMapEntry):
            Optional. The CertificateMapEntry event
            payload. Unset for deletion events.

            This field is a member of `oneof`_ ``_payload``.
    """

    payload: 'CertificateMapEntry' = proto.Field(
        proto.MESSAGE,
        number=1,
        optional=True,
        message='CertificateMapEntry',
    )


class CertificateMapEventData(proto.Message):
    r"""The data within all CertificateMap events.

    .. _oneof: https://proto-plus-python.readthedocs.io/en/stable/fields.html#oneofs-mutually-exclusive-fields

    Attributes:
        payload (google.events.cloud.certificatemanager_v1.types.CertificateMap):
            Optional. The CertificateMap event payload.
            Unset for deletion events.

            This field is a member of `oneof`_ ``_payload``.
    """

    payload: 'CertificateMap' = proto.Field(
        proto.MESSAGE,
        number=1,
        optional=True,
        message='CertificateMap',
    )


class CertificateEventData(proto.Message):
    r"""The data within all Certificate events.

    .. _oneof: https://proto-plus-python.readthedocs.io/en/stable/fields.html#oneofs-mutually-exclusive-fields

    Attributes:
        payload (google.events.cloud.certificatemanager_v1.types.Certificate):
            Optional. The Certificate event payload.
            Unset for deletion events.

            This field is a member of `oneof`_ ``_payload``.
    """

    payload: 'Certificate' = proto.Field(
        proto.MESSAGE,
        number=1,
        optional=True,
        message='Certificate',
    )


__all__ = tuple(sorted(__protobuf__.manifest))
