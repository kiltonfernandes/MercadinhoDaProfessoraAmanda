import EmojiPicker, {
  Categories,
  EmojiStyle,
  type EmojiClickData,
} from 'emoji-picker-react'
import pt from 'emoji-picker-react/dist/data/emojis-pt'

type EmojiSelectorProps = {
  mode: 'product' | 'avatar'
  onChange: (emoji: string) => void
}

export default function EmojiSelector({ mode, onChange }: EmojiSelectorProps) {
  const isAvatar = mode === 'avatar'

  return (
    <div className="full-emoji-picker">
      <EmojiPicker
        categories={isAvatar ? [
          { category: Categories.SMILEYS_PEOPLE, name: 'Rostos e pessoas' },
        ] : undefined}
        emojiData={pt}
        emojiStyle={EmojiStyle.NATIVE}
        height={340}
        lazyLoadEmojis
        onEmojiClick={(emoji: EmojiClickData) => onChange(emoji.emoji)}
        previewConfig={{ showPreview: false }}
        searchClearButtonLabel="Limpar busca"
        searchPlaceholder={isAvatar ? 'Buscar rosto, pessoa ou profissão...' : 'Buscar qualquer emoji...'}
        skinTonesDisabled={!isAvatar}
        width="100%"
      />
    </div>
  )
}
