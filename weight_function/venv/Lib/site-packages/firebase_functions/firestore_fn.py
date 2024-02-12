# Copyright 2022 Google Inc.
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
"""
Module for Cloud Functions that are triggered by Firestore.
"""
# pylint: disable=protected-access
import dataclasses as _dataclass
import functools as _functools
import typing as _typing
import google.events.cloud.firestore as _firestore
import google.cloud.firestore_v1 as _firestore_v1
import firebase_functions.private.util as _util
import firebase_functions.private.path_pattern as _path_pattern
import firebase_functions.core as _core
import cloudevents.http as _ce

from firebase_admin import initialize_app, get_app, _apps, _DEFAULT_APP_NAME
from google.cloud._helpers import _datetime_to_pb_timestamp
from google.cloud.firestore_v1 import _helpers as _firestore_helpers

from google.cloud.firestore_v1 import DocumentSnapshot, DocumentReference
from firebase_functions.options import FirestoreOptions
from firebase_functions.core import Change

_event_type_written = "google.cloud.firestore.document.v1.written"
_event_type_created = "google.cloud.firestore.document.v1.created"
_event_type_updated = "google.cloud.firestore.document.v1.updated"
_event_type_deleted = "google.cloud.firestore.document.v1.deleted"


@_dataclass.dataclass(frozen=True)
class Event(_core.CloudEvent[_core.T]):
    """
    A CloudEvent that contains a ``DocumentSnapshot`` or a ``Change<DocumentSnapshot>``.
    """

    location: str
    """
    The location of the database.
    """

    project: str
    """
    The project identifier.
    """

    database: str
    """
    The Firestore database.
    """

    namespace: str
    """
    The Firestore namespace.
    """

    document: str
    """
    The document path.
    """

    params: dict[str, str]
    """
    An dict containing the values of the path patterns.
    Only named capture groups are populated - {key}, {key=*}, {key=**}
    """


_E1 = Event[Change[DocumentSnapshot | None]]
_E2 = Event[DocumentSnapshot | None]
_C1 = _typing.Callable[[_E1], None]
_C2 = _typing.Callable[[_E2], None]


def _firestore_endpoint_handler(
    func: _C1 | _C2,
    event_type: str,
    document_pattern: _path_pattern.PathPattern,
    raw: _ce.CloudEvent,
) -> None:
    event_attributes = raw._get_attributes()
    event_data: _typing.Any = raw.get_data()
    firestore_event_data: _firestore.DocumentEventData
    content_type: str = event_attributes["datacontenttype"]
    if "application/json" in content_type or isinstance(event_data, dict):
        firestore_event_data = _firestore.DocumentEventData.from_json(
            event_data)
    elif "application/protobuf" in content_type or isinstance(
            event_data, bytes):
        firestore_event_data = _firestore.DocumentEventData.deserialize(
            event_data)
    else:
        actual_type = type(event_data)
        raise TypeError(f"Firestore: Cannot parse event payload of data type "
                        f"'{actual_type}' and content type '{content_type}'.")

    event_location = event_attributes["location"]
    event_project = event_attributes["project"]
    event_namespace = event_attributes["namespace"]
    event_document = event_attributes["document"]
    event_database = event_attributes["database"]

    time = event_attributes["time"]
    event_time = _util.timestamp_conversion(time)

    if _DEFAULT_APP_NAME not in _apps:
        initialize_app()
    app = get_app()
    firestore_client = _firestore_v1.Client(project=app.project_id,
                                            database=event_database)
    firestore_ref: DocumentReference = firestore_client.document(event_document)
    value_snapshot: DocumentSnapshot | None = None
    old_value_snapshot: DocumentSnapshot | None = None

    if firestore_event_data.value:
        document_dict = _firestore_helpers.decode_dict(
            firestore_event_data.value.fields, firestore_client)
        value_snapshot = _firestore_v1.DocumentSnapshot(
            firestore_ref,
            document_dict,
            True,
            _datetime_to_pb_timestamp(event_time),
            firestore_event_data.value.create_time,
            firestore_event_data.value.update_time,
        )
    if firestore_event_data.old_value:
        document_dict = _firestore_helpers.decode_dict(
            firestore_event_data.old_value.fields, firestore_client)
        old_value_snapshot = _firestore_v1.DocumentSnapshot(
            firestore_ref,
            document_dict,
            True,
            _datetime_to_pb_timestamp(event_time),
            firestore_event_data.old_value.create_time,
            firestore_event_data.old_value.update_time,
        )
    if event_type == _event_type_deleted:
        firestore_event_data = old_value_snapshot
    if event_type == _event_type_created:
        firestore_event_data = value_snapshot
    if event_type in (_event_type_written, _event_type_updated):
        firestore_event_data = Change(
            before=old_value_snapshot,
            after=value_snapshot,
        )

    params: dict[str, str] = {
        **document_pattern.extract_matches(event_document),
    }
    database_event = Event(
        project=event_project,
        namespace=event_namespace,
        database=event_database,
        location=event_location,
        document=event_document,
        specversion=event_attributes["specversion"],
        id=event_attributes["id"],
        source=event_attributes["source"],
        type=event_attributes["type"],
        time=event_time,
        data=firestore_event_data,
        subject=event_attributes["subject"],
        params=params,
    )
    func(database_event)


@_util.copy_func_kwargs(FirestoreOptions)
def on_document_written(**kwargs) -> _typing.Callable[[_C1], _C1]:
    """
    Event handler that triggers when a document is created, updated, or deleted in Firestore.

    Example:

    .. code-block:: python

      @on_document_written(document="*")
      def example(event: Event[Change[DocumentSnapshot]]) -> None:
          pass

    :param \\*\\*kwargs: Firestore options.
    :type \\*\\*kwargs: as :exc:`firebase_functions.options.FirestoreOptions`
    :rtype: :exc:`typing.Callable`
            \\[ \\[ :exc:`firebase_functions.firestore_fn.Event` \\[
            :exc:`firebase_functions.db.Change` \\] \\], `None` \\]
            A function that takes a Firestore event and returns ``None``.
    """
    options = FirestoreOptions(**kwargs)

    def on_document_written_inner_decorator(func: _C1):
        document_pattern = _path_pattern.PathPattern(
            _util.normalize_path(options.document))

        @_functools.wraps(func)
        def on_document_written_wrapped(raw: _ce.CloudEvent):
            return _firestore_endpoint_handler(
                func,
                _event_type_written,
                document_pattern,
                raw,
            )

        _util.set_func_endpoint_attr(
            on_document_written_wrapped,
            options._endpoint(
                event_type=_event_type_written,
                func_name=func.__name__,
                document_pattern=document_pattern,
            ),
        )
        return on_document_written_wrapped

    return on_document_written_inner_decorator


@_util.copy_func_kwargs(FirestoreOptions)
def on_document_updated(**kwargs) -> _typing.Callable[[_C1], _C1]:
    """
    Event handler that triggers when a document is updated in Firestore.

    Example:

    .. code-block:: python

      @on_document_updated(document="*")
      def example(event: Event[Change[DocumentSnapshot]]) -> None:
          pass

    :param \\*\\*kwargs: Firestore options.
    :type \\*\\*kwargs: as :exc:`firebase_functions.options.FirestoreOptions`
    :rtype: :exc:`typing.Callable`
            \\[ \\[ :exc:`firebase_functions.firestore_fn.Event` \\[
            :exc:`firebase_functions.db.Change` \\] \\], `None` \\]
            A function that takes a Firestore event and returns ``None``.
    """
    options = FirestoreOptions(**kwargs)

    def on_document_updated_inner_decorator(func: _C1):
        document_pattern = _path_pattern.PathPattern(
            _util.normalize_path(options.document))

        @_functools.wraps(func)
        def on_document_updated_wrapped(raw: _ce.CloudEvent):
            return _firestore_endpoint_handler(
                func,
                _event_type_updated,
                document_pattern,
                raw,
            )

        _util.set_func_endpoint_attr(
            on_document_updated_wrapped,
            options._endpoint(
                event_type=_event_type_updated,
                func_name=func.__name__,
                document_pattern=document_pattern,
            ),
        )
        return on_document_updated_wrapped

    return on_document_updated_inner_decorator


@_util.copy_func_kwargs(FirestoreOptions)
def on_document_created(**kwargs) -> _typing.Callable[[_C2], _C2]:
    """
    Event handler that triggers when a document is created in Firestore.

    Example:

    .. code-block:: python

        @on_document_created(document="*")
        def example(event: Event[DocumentSnapshot]):
          pass

    :param \\*\\*kwargs: Firestore options.
    :type \\*\\*kwargs: as :exc:`firebase_functions.options.FirestoreOptions`
    :rtype: :exc:`typing.Callable`
            \\[ \\[ :exc:`firebase_functions.firestore_fn.Event` \\[
            :exc:`object` \\] \\], `None` \\]
            A function that takes a Firestore event and returns ``None``.
    """
    options = FirestoreOptions(**kwargs)

    def on_document_created_inner_decorator(func: _C2):
        document_pattern = _path_pattern.PathPattern(
            _util.normalize_path(options.document))

        @_functools.wraps(func)
        def on_document_created_wrapped(raw: _ce.CloudEvent):
            return _firestore_endpoint_handler(
                func,
                _event_type_created,
                document_pattern,
                raw,
            )

        _util.set_func_endpoint_attr(
            on_document_created_wrapped,
            options._endpoint(
                event_type=_event_type_created,
                func_name=func.__name__,
                document_pattern=document_pattern,
            ),
        )
        return on_document_created_wrapped

    return on_document_created_inner_decorator


@_util.copy_func_kwargs(FirestoreOptions)
def on_document_deleted(**kwargs) -> _typing.Callable[[_C2], _C2]:
    """
    Event handler that triggers when a document is deleted in Firestore.

    Example:

    .. code-block:: python

      @on_document_deleted(document="*")
      def example(event: Event[DocumentSnapshot]) -> None:
          pass

    :param \\*\\*kwargs: Firestore options.
    :type \\*\\*kwargs: as :exc:`firebase_functions.options.FirestoreOptions`
    :rtype: :exc:`typing.Callable`
            \\[ \\[ :exc:`firebase_functions.firestore_fn.Event` \\[
            :exc:`object` \\] \\], `None` \\]
            A function that takes a Firestore event and returns ``None``.
    """
    options = FirestoreOptions(**kwargs)

    def on_document_deleted_inner_decorator(func: _C2):
        document_pattern = _path_pattern.PathPattern(
            _util.normalize_path(options.document))

        @_functools.wraps(func)
        def on_document_deleted_wrapped(raw: _ce.CloudEvent):
            return _firestore_endpoint_handler(
                func,
                _event_type_deleted,
                document_pattern,
                raw,
            )

        _util.set_func_endpoint_attr(
            on_document_deleted_wrapped,
            options._endpoint(
                event_type=_event_type_deleted,
                func_name=func.__name__,
                document_pattern=document_pattern,
            ),
        )
        return on_document_deleted_wrapped

    return on_document_deleted_inner_decorator
