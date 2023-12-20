import Component from '@glimmer/component';
import {action} from '@ember/object';
import {tracked} from '@glimmer/tracking';
import {service} from '@ember/service';
import {guidFor} from '@ember/object/internals';
import {schedule} from '@ember/runloop';

const PLUGINS = [
  'advlist',
  'anchor',
  'autolink',
  'autoresize',
  'charmap',
  'charmap',
  'emoticons',
  'emoticons/js/emojiimages.js',
  'emoticons/js/emojis.js',
  'fullscreen',
  'help',
  'insertdatetime',
  'link',
  'lists',
  'media',
  'nonbreaking',
  'pagebreak',
  'preview',
  'searchreplace',
  'table',
  'visualblocks',
  'visualchars',
  'wordcount',
];

export default class WysiwygEditorComponent extends Component {
  @service house;

  @tracked isLoading = false;
  @tracked isReady = false;
  @tracked didError = false;

  editor = null;

  constructor() {
    super(...arguments);

    this.isLoading = true;
    this.initialText = this.args.text;
    this.elementId = this.args.id ?? guidFor(this);
  }

  @action
  elementInsertedEvent() {
    setTimeout(() => {
      schedule('afterRender', () => this._loadEditor())
    }, 100);
  }

  async _loadEditor() {
    try {
      let editorModule = window.tinymce;
      if (!editorModule) {
        editorModule = (await import('tinymce')).default;

        await import('tinymce/themes/silver');
        await import('tinymce/icons/default');
        await import('tinymce/models/dom');
        await import('tinymce/skins/ui/oxide/skin.min.css');

        for (let i = 0; i < PLUGINS.length; i++) {
          await import(`tinymce/plugins/${PLUGINS[i]}`);
        }
      }

      const contentCSS = (await import('tinymce/skins/content/default/content.min.css?raw')).default;
      const uiCSS = (await import('tinymce/skins/ui/oxide/content.min.css?raw')).default;

      editorModule.init({
        selector: '#' + this.elementId,
        content_css: false,
        content_style: `${contentCSS}\n${uiCSS}`,
        contextmenu: 'link image imagetools table configurepermanentpen',
        image_advtab: true,
        min_height: 600,
        menubar: 'edit view insert format tools table tc help',
        plugins: [
          'advlist',
          'anchor',
          'autolink',
          'autoresize',
          'charmap',
          'charmap',
          'emoticons',
          'emoticons',
          'fullscreen',
          'help',
          'insertdatetime',
          'link',
          'lists',
          'media',
          'nonbreaking',
          'pagebreak',
          'preview',
          'searchreplace',
          'table',
          'visualblocks',
          'visualchars',
          'wordcount',
        ],
        promotion: false,
        quickbars_selection_toolbar: 'bold italic | quicklink h2 h3 blockquote quickimage quicktable',
        resize: true,
        skin: false,
        toolbar_mode: 'sliding',

        init_instance_callback: (editor) => {
          this.editor = editor;
          editor.on('Change', () => this.args.onChange(editor.getContent()));
        },
      });
      this.isReady = true;
    } catch (response) {
      this.house.handleErrorResponse(response);
      this.didError = true;
      this.args.onLoadError?.();
    } finally {
      this.isLoading = false;
    }
  }

  willDestroy() {
    super.willDestroy(...arguments);

    if (this.editor) {
      this.editor.remove('#' + this.elementId);
    }
  }
}
