var expect = require('chai').expect;
var nlc = require('../lib/node-linkchecker');
var server = require('./lib/testserver');

var tests = [
  {
    url: server.fixtures() + 'brokenLinksValid.html',
    desc: 'document with valid links and fragments',
    expected: {
      brokenLinks: [],
      brokenFragments: []
    }
  },
  {
    url: server.fixtures() + 'brokenLinksInvalid.html',
    desc: 'document with broken links',
    expected: {
      brokenLinks: [
        { link: server.fixtures() + 'assets/i-do-not-exist.css',status: 404 },
        { link: server.fixtures() + 'assets/i-do-not-exist.jpg',status: 404 },
        { link: server.fixtures() + 'script.js',status: 404 }
      ],
      brokenFragments: []
    }
  },
  {
    url: server.fixtures() + 'brokenFragmentsInvalid.html',
    desc: 'document with broken fragments',
    expected: {
      brokenLinks: [],
      brokenFragments: [
        { link: server.fixtures() + 'brokenFragmentsInvalid.html#foobar',status:200 }
      ]
    }
  },
  {
    url: server.fixtures() + 'broken.html',
    desc: 'document with broken links and broken fragments',
    expected: {
      brokenLinks: [
        { link: server.fixtures() + 'assets/i-do-not-exist.css',status: 404 },
        { link: server.fixtures() + 'assets/i-do-not-exist.jpg',status: 404 },
        { link: server.fixtures() + 'script.js',status: 404 }
      ],
      brokenFragments: [
        { link: server.fixtures() + 'broken.html#foobar',status:200 }
      ]
    }
  },
  {
    url: server.fixtures() + 'schemes.html',
    desc: 'https links with default options',
    expected: {
      brokenLinks: [
        { link: 'https://www.example.org/foobar',status: 404 }
      ],
      brokenFragments: []
    }
  },
  {
    url: server.fixtures() + 'schemes.html',
    desc: 'options overriden to check http links only',
    options: {
      schemes: ['http']
    },
    expected: {
      brokenLinks: [],
      brokenFragments: []
    }
  }
];

describe('node-linkchecker', function() {
  describe('check()', function () {
    it('should be a function', function () {
      expect(nlc.check).to.be.a('asyncfunction');
    })
    tests.forEach(function(test) {
      it(test.desc, async function() {
        const res = await nlc.check(test.url, test.options);
        expect(res).to.deep.equal(test.expected);
      });
    });
    it("should return the proper linkmap", async function() {
      const res = await nlc.linkmap(server.fixtures() + 'brokenLinksValid.html');
      const expected = {'assets/foo.css': [],
                        'assets/w3c_home.png': [],
                        'brokenLinksValid.html':  ["foo", "foobar"],
                        'broken.html': ['foo']};
      expect(res).to.deep.equal(expected);
    });
  });
});
