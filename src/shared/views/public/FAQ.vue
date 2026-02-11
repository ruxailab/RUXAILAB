<template>
  <div class="faq container">
    <h1>{{ $t('faq.title') }}</h1>
    <p>{{ $t('faq.subtitle') }}</p>

    <h2>{{ $t('faq.questions.q1.question') }}</h2>
    <p>{{ $t('faq.questions.q1.answer') }}</p>

    <h2>{{ $t('faq.questions.q2.question') }}</h2>
    <p>
      {{ $t('faq.questions.q2.answer_part1') }}
      <a href="https://github.com/ruxailab/RUXAILAB" target="_blank">{{
        $t('faq.questions.q2.link_text')
      }}</a>
      {{ $t('faq.questions.q2.answer_part2') }}
      <router-link to="/help">{{
        $t('faq.questions.q2.help_link')
      }}</router-link>
      {{ $t('faq.questions.q2.answer_part3') }}
    </p>

    <h2>{{ $t('faq.questions.q3.question') }}</h2>
    <p>{{ $t('faq.questions.q3.answer') }}</p>

    <h2>{{ $t('faq.questions.q4.question') }}</h2>
    <p>{{ $t('faq.questions.q4.answer') }}</p>

    <h2>{{ $t('faq.questions.q5.question') }}</h2>
    <p>
      {{ $t('faq.questions.q5.answer') }}
      <a href="https://github.com/ruxailab/RUXAILAB/issues" target="_blank">{{
        $t('faq.questions.q5.link_text')
      }}</a>
      {{ $t('faq.questions.q5.answer_part2') }}
    </p>

    <h2>{{ $t('faq.questions.q6.question') }}</h2>
    <p>
      {{ $t('faq.questions.q6.answer') }}
      <a href="https://github.com/ruxailab/RUXAILAB" target="_blank">{{
        $t('faq.questions.q6.link_text')
      }}</a>
      {{ $t('faq.questions.q6.answer_part2') }}
    </p>

    <h2>{{ $t('faq.questions.q7.question') }}</h2>
    <p>
      {{ $t('faq.questions.q7.answer') }}
      <router-link to="/privacy-policy">{{
        $t('faq.questions.q7.link_text')
      }}</router-link>
      {{ $t('faq.questions.q7.answer_part2') }}
    </p>

    <h2>{{ $t('faq.questions.q8.question') }}</h2>
    <p>{{ $t('faq.questions.q8.answer') }}</p>

    <h2>{{ $t('faq.questions.q9.question') }}</h2>
    <p>{{ $t('faq.questions.q9.answer') }}</p>
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
a {
  color: #007bff;
  text-decoration: none;
}
a:hover {
  text-decoration: underline;
}
</style>
