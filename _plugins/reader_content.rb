# Enhance generated content at build time: reading works without JavaScript.
require 'nokogiri'
require 'uri'
require 'cgi'

module ReaderContent
  def self.enhance(document)
    return unless document.output_ext == '.html'
    fragment = Nokogiri::HTML::DocumentFragment.parse(document.content)
    # A historical notebook export embeds its own document head in article content.
    if document.relative_path.include?('2020-10-09-tensorflow-tutorial')
      fragment.css('title, link[href="custom.css"]').remove
    end
    site = document.site
    manifest = site.data.fetch('responsive_images', {})
    first_image = fragment.at_css('img[src]')
    if document.respond_to?(:collection) && document.collection.label == 'posts'
      document.data['image'] ||= document.data['share-img'] || first_image&.[]('src')
      description = fragment.css('p').find { |p| p.text.strip.length > 60 && !p.text.match?(/\A\s*Disclaimer:/i) }
      document.data['description'] ||= document.data['meta-description'] || document.data['subtitle'] || description&.text&.gsub(/\s+/, ' ')&.strip&.slice(0, 200)
      document.data['last_modified_at'] ||= document.data['last-updated']
      headings = fragment.css('h2[id], h3[id]')
      document.data['reader_headings'] = headings.map { |h| { 'id' => h['id'], 'text' => h.text, 'level' => h.name } }
      headings.each do |heading|
        link = Nokogiri::XML::Node.new('a', fragment)
        link['href'] = "##{heading['id']}"
        link['class'] = 'heading-permalink'
        link['aria-label'] = "Link to section: #{heading.text}"
        link.content = '#'
        heading.add_child(link)
      end
    end
    fragment.css('img[src]').each do |img|
      uri = URI.parse(img['src']) rescue nil
      next unless uri && (uri.host.nil? || uri.host == URI(site.config['url']).host)
      key = CGI.unescape(uri.path).delete_prefix(site.baseurl.to_s)
      data = manifest[key]
      next unless data
      img['width'] = data['width'].to_s
      img['height'] = data['height'].to_s
      img['decoding'] = 'async'
      img['loading'] = img == first_image ? 'eager' : 'lazy'
      img['fetchpriority'] = 'high' if img == first_image
      variants = data['variants']
      img['srcset'] = variants.map { |v| "#{site.baseurl}#{v['url']} #{v['width']}w" }.join(', ')
      img['sizes'] ||= '(min-width: 1200px) 750px, (min-width: 768px) 90vw, calc(100vw - 30px)'
      img['data-full-src'] = img['src']
      img['src'] = "#{site.baseurl}#{variants.last['url']}"
    end
    document.content = fragment.to_html
  end
end
Jekyll::Hooks.register [:documents, :pages], :post_convert do |document|
  ReaderContent.enhance(document)
end
