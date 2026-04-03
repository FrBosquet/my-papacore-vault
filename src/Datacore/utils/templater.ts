type Templater = {
  current_functions_object: {
    file: {
      create_new: (content: string, path: string) => Promise<void>
      find_tfile: (templateName: string) => Promise<string>
    }
  }
}

const getTemplaterInstance = () => {
  // @ts-expect-error this is unsafe
  const plugins = dc.app.plugins as {
    getPlugin: (name: string) => { templater: Templater }
  }
  const instance = plugins.getPlugin('templater-obsidian')

  if (!instance) {
    throw new Error('Templater plugin not found')
  }

  return instance.templater
}

export const createNewGame = async (title: string) => {
  const templater = getTemplaterInstance()
  const template =
    await templater.current_functions_object.file.find_tfile('game')
  if (!template) {
    throw new Error('Game template not found')
  }
  await templater.current_functions_object.file.create_new(
    template,
    `Gaming/Games/${title}.md`
  )
}
