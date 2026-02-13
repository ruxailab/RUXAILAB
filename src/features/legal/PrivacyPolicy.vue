<template>
  <div class="privacy-policy container">
    <h1>{{ $t('privacyPolicy.title') }}</h1>
    <p>
      <strong>{{ $t('privacyPolicy.lastUpdated') }}</strong>
    </p>

    <h2>{{ $t('privacyPolicy.sections.introduction.title') }}</h2>
    <p>
      {{ $t('privacyPolicy.sections.introduction.content') }}
    </p>

    <h2>{{ $t('privacyPolicy.sections.informationCollected.title') }}</h2>
    <p>
      {{ $t('privacyPolicy.sections.informationCollected.content') }}
    </p>
    <ul>
      <li>
        {{ $t('privacyPolicy.sections.informationCollected.items.email') }}
      </li>
      <li>
        {{ $t('privacyPolicy.sections.informationCollected.items.usage') }}
      </li>
      <li>
        {{
          $t('privacyPolicy.sections.informationCollected.items.contributions')
        }}
      </li>
    </ul>

    <h2>{{ $t('privacyPolicy.sections.usage.title') }}</h2>
    <p>{{ $t('privacyPolicy.sections.usage.content') }}</p>
    <ul>
      <li>{{ $t('privacyPolicy.sections.usage.items.improve') }}</li>
      <li>{{ $t('privacyPolicy.sections.usage.items.communicate') }}</li>
      <li>{{ $t('privacyPolicy.sections.usage.items.analyze') }}</li>
    </ul>

    <h2>{{ $t('privacyPolicy.sections.sharing.title') }}</h2>
    <p>
      {{ $t('privacyPolicy.sections.sharing.content') }}
    </p>

    <h2>{{ $t('privacyPolicy.sections.cookies.title') }}</h2>
    <p>
      {{ $t('privacyPolicy.sections.cookies.content') }}
    </p>

    <h2>{{ $t('privacyPolicy.sections.security.title') }}</h2>
    <p>
      {{ $t('privacyPolicy.sections.security.content') }}
    </p>

    <h2>{{ $t('privacyPolicy.sections.rights.title') }}</h2>
    <p>
      {{ $t('privacyPolicy.sections.rights.content') }}
    </p>

    <h2>{{ $t('privacyPolicy.sections.changes.title') }}</h2>
    <p>
      {{ $t('privacyPolicy.sections.changes.content') }}
    </p>

    <h2>{{ $t('privacyPolicy.sections.contact.title') }}</h2>
    <p>
      {{ $t('privacyPolicy.sections.contact.content') }}
    </p>
  </div>
</template>

<style scoped>
.container {
  max-width: 800px;
  margin: 0 auto;
  padding: 20px;
  font-family: Arial, sans-serif;
  line-height: 1.6;
}
h1 {
  font-size: 2.5em;
  margin-bottom: 20px;
}
h2 {
  font-size: 1.5em;
  margin-top: 30px;
  margin-bottom: 10px;
}
p {
  margin-bottom: 15px;
}
ul {
  margin-bottom: 15px;
  padding-left: 20px;
}
li {
  margin-bottom: 5px;
}
</style>
