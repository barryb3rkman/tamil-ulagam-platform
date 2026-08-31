// Pure TS, zero Deno-specific APIs — runs directly under Node's built-in
// test runner, exactly like email-template.test.ts. Only
// `parseSecretKeysDictionary` is covered here; `createServiceRoleClient`
// itself (the `Deno.env.get` + `createClient` wrapper) is Deno-only and
// untestable under Node, matching this repo's established pattern.
import assert from "node:assert/strict";
import { describe, it } from "node:test";

import { parseSecretKeysDictionary } from "./secret-keys.ts";

describe("parseSecretKeysDictionary", () => {
  it('returns the "default" entry from a well-formed dictionary', () => {
    assert.equal(
      parseSecretKeysDictionary('{"default":"sb_secret_example"}'),
      "sb_secret_example",
    );
  });

  it('returns the "default" entry even when other named keys are present', () => {
    assert.equal(
      parseSecretKeysDictionary(
        '{"default":"sb_secret_example","reporting":"sb_secret_other"}',
      ),
      "sb_secret_example",
    );
  });

  it("fails closed when the env var is undefined", () => {
    assert.throws(
      () => parseSecretKeysDictionary(undefined),
      /SUPABASE_SECRET_KEYS is not set/,
    );
  });

  it("fails closed when the env var is an empty string", () => {
    assert.throws(
      () => parseSecretKeysDictionary(""),
      /SUPABASE_SECRET_KEYS is not set/,
    );
  });

  it("fails closed on invalid JSON rather than proceeding with a broken key", () => {
    assert.throws(
      () => parseSecretKeysDictionary("{not valid json"),
      /not valid JSON/,
    );
  });

  it("fails closed when the parsed value is a JSON array, not an object", () => {
    assert.throws(
      () => parseSecretKeysDictionary('["sb_secret_example"]'),
      /not a JSON object/,
    );
  });

  it("fails closed when the parsed value is a JSON primitive, not an object", () => {
    assert.throws(
      () => parseSecretKeysDictionary('"sb_secret_example"'),
      /not a JSON object/,
    );
  });

  it("fails closed when the parsed value is null", () => {
    assert.throws(() => parseSecretKeysDictionary("null"), /not a JSON object/);
  });

  it('fails closed when the dictionary has no "default" entry', () => {
    assert.throws(
      () => parseSecretKeysDictionary('{"reporting":"sb_secret_other"}'),
      /no usable "default" entry/,
    );
  });

  it('fails closed when "default" is present but not a string', () => {
    assert.throws(
      () => parseSecretKeysDictionary('{"default":12345}'),
      /no usable "default" entry/,
    );
  });

  it('fails closed when "default" is an empty string', () => {
    assert.throws(
      () => parseSecretKeysDictionary('{"default":""}'),
      /no usable "default" entry/,
    );
  });

  it("never returns an empty-string fallback for any malformed input", () => {
    const malformedInputs = [
      undefined,
      "",
      "{broken",
      "[]",
      "null",
      "42",
      '{"default":null}',
      '{"default":""}',
      '{"notDefault":"sb_secret_example"}',
    ];
    for (const input of malformedInputs) {
      assert.throws(() => parseSecretKeysDictionary(input));
    }
  });
});
