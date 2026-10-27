import importlib.util
import json
import tempfile
import unittest
from pathlib import Path

spec = importlib.util.spec_from_file_location('validator', Path(__file__).resolve().parents[1] / '_scripts/validate_site.py')
validator = importlib.util.module_from_spec(spec)
spec.loader.exec_module(validator)

class SiteValidationTests(unittest.TestCase):
    def check(self, html):
        with tempfile.TemporaryDirectory() as d:
            root = Path(d)
            (root/'index.html').write_text(html)
            (root/'search.json').write_text('[]')
            return validator.validate(root)
    def test_comments_do_not_become_broken_assets(self):
        self.assertEqual(self.check('<!-- <audio src="/missing.mp3"></audio> -->'), [])
    def test_missing_active_media_is_rejected(self):
        self.assertTrue(any('/missing.mp3' in error for error in self.check('<audio src="/missing.mp3"></audio>')))
    def test_jsonld_and_duplicate_metadata_are_rejected(self):
        errors = self.check('<main id="main-content"></main><title>a</title><title>b</title><script type="application/ld+json">{"x":"bad\nstring"}</script>')
        self.assertTrue(any('invalid JSON-LD' in error for error in errors))
        self.assertTrue(any('one title' in error for error in errors))
    def test_valid_and_broken_fragments(self):
        self.assertEqual(self.check('<h2 id="section">A</h2><a href="#section">Go</a>'), [])
        self.assertTrue(any('missing fragment' in error for error in self.check('<a href="#missing">Go</a>')))

if __name__ == '__main__': unittest.main()
