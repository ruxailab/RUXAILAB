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
# pylint: disable=protected-access
"""
Cloud functions to handle billing events from Firebase Alerts.
"""
import dataclasses as _dataclasses
import functools as _functools
import typing as _typing
import cloudevents.http as _ce
from firebase_functions.alerts import FirebaseAlertData

import firebase_functions.private.util as _util

from firebase_functions.core import T, CloudEvent
from firebase_functions.options import BillingOptions


@_dataclasses.dataclass(frozen=True)
class PlanAutomatedUpdatePayload:
    """
    The internal payload object for billing plan automated updates.
    Payload is wrapped inside a `FirebaseAlertData` object.
    """

    billing_plan: str
    """
    A Firebase billing plan, e.g. "spark" or "blaze".
    """

    notification_type: str
    """
    The type of the notification, e.g. "upgrade_plan" or "downgrade_plan".
    """


@_dataclasses.dataclass(frozen=True)
class PlanUpdatePayload(PlanAutomatedUpdatePayload):
    """
    The internal payload object for billing plan updates.
    Payload is wrapped inside a `FirebaseAlertData` object.
    """

    principal_email: str
    """
    The email address of the person that triggered billing plan change.
    """


@_dataclasses.dataclass(frozen=True)
class BillingEvent(CloudEvent[FirebaseAlertData[T]]):
    """
    A custom CloudEvent for billing Firebase Alerts.
    """

    alert_type: str
    """
    The type of the alerts that got triggered.
    """


BillingPlanUpdateEvent = BillingEvent[PlanUpdatePayload]
"""
The type of the event for 'on_plan_update_published' functions.
"""

BillingPlanAutomatedUpdateEvent = BillingEvent[PlanAutomatedUpdatePayload]
"""
The type of the event for 'on_plan_automated_update_published' functions.
"""

OnPlanUpdatePublishedCallable = _typing.Callable[[BillingPlanUpdateEvent], None]
"""
The type of the callable for 'on_plan_update_published' functions.
"""

OnPlanAutomatedUpdatePublishedCallable = _typing.Callable[
    [BillingPlanAutomatedUpdateEvent], None]
"""
The type of the callable for 'on_plan_automated_update_published' functions.
"""


@_util.copy_func_kwargs(BillingOptions)
def on_plan_update_published(
    **kwargs
) -> _typing.Callable[[OnPlanUpdatePublishedCallable],
                      OnPlanUpdatePublishedCallable]:
    """
    Event handler which triggers when a Firebase Alerts billing event is published.

    Example:

    .. code-block:: python

      import firebase_functions.alerts.billing_fn as billing_fn   

      @billing_fn.on_plan_update_published()
      def example(alert: billing_fn.BillingPlanUpdateEvent) -> None:
          print(alert)

    :param \\*\\*kwargs: Options.
    :type \\*\\*kwargs: as :exc:`firebase_functions.options.BillingOptions`
    :rtype: :exc:`typing.Callable`
            \\[ 
            \\[ :exc:`firebase_functions.alerts.billing_fn.BillingPlanUpdateEvent` \\], 
            `None` 
            \\]
            A function that takes a BillingPlanUpdateEvent and returns None.
    """
    options = BillingOptions(**kwargs)

    def on_plan_update_published_inner_decorator(
            func: OnPlanUpdatePublishedCallable):

        @_functools.wraps(func)
        def on_plan_update_published_wrapped(raw: _ce.CloudEvent):
            from firebase_functions.private._alerts_fn import billing_event_from_ce
            func(billing_event_from_ce(raw))

        _util.set_func_endpoint_attr(
            on_plan_update_published_wrapped,
            options._endpoint(
                func_name=func.__name__,
                alert_type='billing.planUpdate',
            ),
        )
        return on_plan_update_published_wrapped

    return on_plan_update_published_inner_decorator


@_util.copy_func_kwargs(BillingOptions)
def on_plan_automated_update_published(
    **kwargs
) -> _typing.Callable[[OnPlanAutomatedUpdatePublishedCallable],
                      OnPlanAutomatedUpdatePublishedCallable]:
    """
    Event handler which triggers when a Firebase Alerts billing event is published.

    Example:

    .. code-block:: python

      import firebase_functions.alerts.billing_fn as billing_fn   

      @billing_fn.on_plan_automated_update_published()
      def example(alert: billing_fn.BillingPlanAutomatedUpdateEvent) -> None:
          print(alert)

    :param \\*\\*kwargs: Options.
    :type \\*\\*kwargs: as :exc:`firebase_functions.options.BillingOptions`
    :rtype: :exc:`typing.Callable`
            \\[ 
            \\[ :exc:`firebase_functions.alerts.billing_fn.BillingPlanAutomatedUpdateEvent` \\], 
            `None` 
            \\]
            A function that takes a BillingPlanUpdateEvent and returns None.
    """
    options = BillingOptions(**kwargs)

    def on_plan_automated_update_published_inner_decorator(
            func: OnPlanAutomatedUpdatePublishedCallable):

        @_functools.wraps(func)
        def on_plan_automated_update_published_wrapped(raw: _ce.CloudEvent):
            from firebase_functions.private._alerts_fn import billing_event_from_ce
            func(billing_event_from_ce(raw))

        _util.set_func_endpoint_attr(
            on_plan_automated_update_published_wrapped,
            options._endpoint(
                func_name=func.__name__,
                alert_type='billing.planAutomatedUpdate',
            ),
        )
        return on_plan_automated_update_published_wrapped

    return on_plan_automated_update_published_inner_decorator
